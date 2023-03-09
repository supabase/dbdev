use anyhow;
use clap::{Parser, Subcommand};

use std::path::PathBuf;
use tokio;

mod commands;
mod models;
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
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap();

    // You can check for the existence of subcommands, and if found use their
    // matches just as you would the top level cmd
    match &cli.command {
        Commands::Uninstall {
            connection,
            package,
        } => {
            let conn = util::get_connection(&runtime, &connection)?;
            commands::uninstall::uninstall(&runtime, package, conn)?;
            Ok(())
        }

        Commands::Install {
            connection,
            package,
            path,
        } => {
            if let Some(rel_or_abs_path) = path {
                let payload = models::Payload::from_pathbuf(rel_or_abs_path)?;
                let conn = util::get_connection(&runtime, &connection)?;
                commands::install::install(&runtime, &payload, conn)?;
                Ok(())
            } else {
                if let Some(package) = package {
                    Err(anyhow::anyhow!(
                        "Remote package {package} installing not yet supported"
                    ))
                } else {
                    Err(anyhow::anyhow!("Not implemented"))
                }
            }
        }
    }
}
