use clap::{Parser, Subcommand};
use config::Config;

use std::{env, path::PathBuf};

mod client;
mod commands;
mod config;
mod credential_store;
mod models;
mod secret;
mod util;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Turn debugging information on
    #[arg(short, long)]
    debug: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Install a package to a database
    Install {
        /// PostgreSQL connection string
        #[arg(short, long)]
        connection: String,

        #[clap(flatten)]
        install_args: InstallArgs,
    },

    /// Generate a migration file that installs a package to a database
    Add {
        /// PostgreSQL connection string
        #[arg(short, long)]
        connection: String,

        /// Location to create the migration SQL file
        #[arg(short, long, value_parser)]
        output_path: PathBuf,

        #[clap(flatten)]
        install_args: InstallArgs,
    },

    /// Uninstall a package from a database
    Uninstall {
        /// PostgreSQL connection string
        #[arg(short, long)]
        connection: String,

        #[arg(short, long)]
        /// Package name on database.new in form handle/package
        package: String,
    },

    /// Publish a package
    Publish {
        /// Path of the local directory containing the package
        #[arg(long)]
        path: Option<PathBuf>,

        /// Name of the registry to publish to
        #[arg(long)]
        registry_name: Option<String>,
    },

    /// Login to a dbdev account
    Login {
        /// Name of the registry to login to
        #[arg(long)]
        registry_name: Option<String>,
    },

    /// List available packages
    #[clap(alias = "ls")]
    List {
        /// PostgreSQL connection string
        #[arg(short, long)]
        connection: String,
    },
}

#[derive(Debug, clap::Args)]
#[group(required = false, multiple = false)]
pub struct InstallArgs {
    #[arg(short, long)]
    /// Package name on database.dev in handle/package form
    package: Option<String>,

    /// Path of the local directory containing the package
    #[arg(long)]
    path: Option<PathBuf>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    // You can check for the existence of subcommands, and if found use their
    // matches just as you would the top level cmd
    match &cli.command {
        Commands::Publish {
            path,
            registry_name,
        } => {
            let config = Config::read_from_default_file()?;
            let registry_name = registry_name
                .as_ref()
                .unwrap_or(&config.default_registry.name);
            let registry = config.get_registry(registry_name)?;
            let client = client::APIClient::from_registry(registry)?;
            let current_dir = env::current_dir()?;
            let extension_dir = path.as_ref().unwrap_or(&current_dir);
            commands::publish::publish(&client, extension_dir, registry_name).await?;
            Ok(())
        }

        Commands::Uninstall {
            connection,
            package,
        } => {
            let conn = util::get_connection(connection).await?;
            commands::uninstall::uninstall(package, conn).await?;
            Ok(())
        }

        Commands::Install {
            connection,
            install_args: InstallArgs { package, path },
        } => {
            if let Some(package) = package {
                return Err(anyhow::anyhow!(
                    "Remote package {package} installing not yet supported"
                ));
            }

            let current_dir = env::current_dir()?;
            let extension_dir = path.as_ref().unwrap_or(&current_dir);
            let payload = models::Payload::from_path(extension_dir)?;
            let conn = util::get_connection(connection).await?;

            commands::install::install(&payload, conn).await?;

            Ok(())
        }

        Commands::Add {
            connection,
            output_path,
            install_args: InstallArgs { path, package },
        } => {
            if let Some(_package) = package {
                return Err(anyhow::anyhow!(
                    "Generating migrations from packages is not yet supported"
                ));
            }

            let current_dir = env::current_dir()?;
            let extension_dir = path.as_ref().unwrap_or(&current_dir);
            let payload = models::Payload::from_path(extension_dir)?;
            let conn = util::get_connection(connection).await?;

            commands::add::add(&payload, &output_path, conn).await?;

            Ok(())
        }

        Commands::Login { registry_name } => {
            let config = Config::read_from_default_file()?;
            let registry_name = registry_name
                .as_ref()
                .unwrap_or(&config.default_registry.name);
            // confirm that a registry with the given name exists
            config.get_registry(registry_name)?;
            commands::login::login(registry_name)?;
            println!("Login successful");
            Ok(())
        }

        Commands::List { connection } => {
            let mut conn = util::get_connection(connection).await?;
            commands::list::list(&mut conn).await?;
            Ok(())
        }
    }
}
