use clap::{Parser, Subcommand};

use std::path::PathBuf;

mod client;
mod commands;
mod credentil_store;
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

    /// Signup for a dbdev account
    Signup {
        /// User handle
        #[arg(long)]
        handle: String,

        #[arg(long)]
        email: String,

        #[arg(long)]
        password: String,
    },

    /// Publish a package
    Publish {
        #[arg(long)]
        handle: String,

        /// From local directory
        #[arg(long)]
        path: PathBuf,
    },

    /// Login to a dbdev account
    Login,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    let client = client::APIClient::new(API_BASE_URL, API_KEY);

    // You can check for the existence of subcommands, and if found use their
    // matches just as you would the top level cmd
    match &cli.command {
        Commands::Signup {
            handle,
            email,
            password,
        } => {
            commands::signup::signup(&client, email, password, handle).await?;
            Ok(())
        }

        Commands::Publish { handle, path } => {
            let payload = models::Payload::from_pathbuf(path)?;
            commands::publish::publish(&client, &payload, handle).await?;
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
                let payload = models::Payload::from_pathbuf(rel_or_abs_path)?;
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
        Commands::Login => {
            commands::login::login().await?;
            Ok(())
        }
    }
}
const API_BASE_URL: &str = "http://localhost:54321";
const API_KEY: &str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
