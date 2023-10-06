use clap::{Parser, Subcommand};
use config::Config;

use std::path::PathBuf;

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

        #[arg(short, long)]
        /// Package name on database.new in form handle/package
        package: Option<String>,

        /// From local directory
        #[arg(long)]
        path: Option<PathBuf>,
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
        /// From local directory
        #[arg(long)]
        path: PathBuf,

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
            commands::publish::publish(&client, path, registry_name).await?;
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
            package,
            path,
        } => {
            if let Some(rel_or_abs_path) = path {
                let payload = models::Payload::from_path(rel_or_abs_path)?;
                let conn = util::get_connection(connection).await?;
                commands::install::install(&payload, conn).await?;
                Ok(())
            } else if let Some(package) = package {
                Err(anyhow::anyhow!(
                    "Remote package {package} installing not yet supported"
                ))
            } else {
                Err(anyhow::anyhow!("Not implemented"))
            }
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
    }
}
