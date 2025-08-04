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
        registry_args: RegistryArgs,
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
        registry_args: RegistryArgs,
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
pub struct RegistryArgs {
    #[command(subcommand)]
    pub source: RegistrySource,
}

#[derive(Debug, clap::Subcommand)]
pub enum RegistrySource {
    /// A package name on a remote registry accessible over a REST API
    Package {
        /// Package name in the registry in handle/package form
        #[arg(short, long)]
        name: String,

        /// Name of the registry to fetch package details from
        #[arg(long)]
        registry_name: Option<String>,
    },
    /// A local directory which contains a package
    Path {
        /// Path of the local directory containing the package (defaults to current directory)
        #[arg(long)]
        directory: Option<PathBuf>,
    },
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
            let client = client::ApiClient::from_registry(registry)?;
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
            registry_args: RegistryArgs { source },
        } => {
            match source {
                RegistrySource::Package {
                    name,
                    registry_name: _,
                } => {
                    return Err(anyhow::anyhow!(
                        "Remote package {name} installing not yet supported"
                    ));
                }
                RegistrySource::Path { directory } => {
                    let current_dir = env::current_dir()?;
                    let extension_dir = directory.as_ref().unwrap_or(&current_dir);
                    let payload = models::Payload::from_path(extension_dir)?;
                    let conn = util::get_connection(connection).await?;

                    commands::install::install(&payload, conn).await?;
                }
            }

            Ok(())
        }

        Commands::Add {
            connection,
            output_path,
            registry_args: RegistryArgs { source },
        } => {
            match source {
                RegistrySource::Package {
                    name,
                    registry_name,
                } => {
                    let config = Config::read_from_default_file()?;
                    let registry_name = registry_name
                        .as_ref()
                        .unwrap_or(&config.default_registry.name);
                    let registry = config.get_registry(registry_name)?;
                    let client = client::ApiClient::from_registry(registry)?;
                    let payload = commands::add::payload_from_package(client, name).await?;
                    let conn = util::get_connection(connection).await?;

                    commands::add::add(&payload, output_path, conn).await?;
                }
                RegistrySource::Path { directory } => {
                    let current_dir = env::current_dir()?;
                    let extension_dir = directory.as_ref().unwrap_or(&current_dir);
                    let payload = models::Payload::from_path(extension_dir)?;
                    let conn = util::get_connection(connection).await?;

                    commands::add::add(&payload, output_path, conn).await?;
                }
            }

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
