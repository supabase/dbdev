use std::ffi::OsStr;
use std::fs;
use std::path::PathBuf;
use std::process;

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Optional name to operate on
    name: Option<String>,

    /// Turn debugging information on
    #[arg(short, long)]
    debug: bool,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Install a package in a database
    Install {
        #[arg(short, long)]
        /// Package name on database.new in form handle/package
        package: Option<String>,

        /// From local directory
        #[arg(long)]
        path: Option<PathBuf>,
    },
}

fn main() {
    let cli = Cli::parse();

    // You can check for the existence of subcommands, and if found use their
    // matches just as you would the top level cmd
    match &cli.command {
        Some(Commands::Install { package, path }) => {
            // Install from Path
            if let Some(rel_or_abs_path) = path {
                let abs_path = match fs::canonicalize(rel_or_abs_path) {
                    Ok(abs_path) => abs_path,
                    Err(e) => {
                        eprintln!("Error: {:?}", e);
                        process::exit(1);
                    }
                };

                if !abs_path.is_dir() {
                    eprintln!("Error: *path* is not a directory");
                    process::exit(1);
                }

                let mut control_files = vec![];
                let mut sql_files = vec![];

                for entry in fs::read_dir(abs_path).unwrap() {
                    match entry {
                        Ok(dir_entry) => {
                            let entry_path = dir_entry.path();
                            if entry_path.is_dir() {
                                continue;
                            }
                            let extension: Option<&str> =
                                entry_path.extension().map(OsStr::to_str).flatten();
                            match extension {
                                Some("control") => control_files.push(entry_path),
                                Some("sql") => sql_files.push(entry_path),
                                _ => continue,
                            }
                        }
                        Err(_) => continue,
                    }
                }

                // /User/<abridge>/some_ext/some_ext.control
                let control_file_path = match control_files.len() {
                    0 => {
                        eprintln!("Error: no control file detected");
                        process::exit(1);
                    }
                    1 => control_files.pop().unwrap(),
                    _ => {
                        eprintln!("Error: multiple control files detected");
                        process::exit(1);
                    }
                };

                // some_ext
                let extension_name = control_file_path
                    .file_name()
                    .map(OsStr::to_str)
                    .flatten()
                    .unwrap()
                    .strip_suffix(".control")
                    .unwrap();

                // TODO: follow the some_ext.control `directory` parameter allowing sql scripts to
                // be somewhere other than the repo root

                let full_install_files = sql_files.iter().filter(|path| {
                    let file_name = path.file_name().map(OsStr::to_str).flatten().unwrap();
                    // Filter here on xxx--ver.sql
                    false
                });

                let upgrade_install_files = sql_files.iter().filter(|path| {
                    let file_name = path.file_name().map(OsStr::to_str).flatten().unwrap();
                    // Filter here on xxx--ver.sql
                    false
                });

                println!("Extension name: {:?}", extension_name);

            // Install from Package
            } else {
                if let Some(package) = package {
                    println!("Remote package {package} installing not yet supported");
                } else {
                    println!("Not Implemented");
                }
            }
        }
        None => {}
    }
}
