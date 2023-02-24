use anyhow;
use anyhow::Context;
use clap::{Parser, Subcommand};
use std::ffi::OsStr;
use std::fs;
use std::path::PathBuf;
use std::process;

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
    /// Install a package in a database
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
            let conn = get_connection(&runtime, &connection)?;
            uninstall(&runtime, package, conn)?;
            Ok(())
        }

        Commands::Install {
            connection,
            package,
            path,
        } => {
            if let Some(rel_or_abs_path) = path {
                let payload = Payload::from_pathbuf(rel_or_abs_path)?;
                let conn = get_connection(&runtime, &connection)?;
                install(&runtime, &payload, conn)?;
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

fn is_valid_extension_name(_name: &str) -> bool {
    true
}

fn is_valid_version(_version: &str) -> bool {
    true
}

use sqlx::postgres::PgConnection;
use sqlx::Connection;
use tokio;
use tokio::runtime::{Builder, Runtime};

pub fn create_async_runtime() -> Runtime {
    Builder::new_current_thread().enable_all().build().unwrap()
}

fn get_connection(rt: &Runtime, connection_str: &str) -> anyhow::Result<PgConnection> {
    rt.block_on(PgConnection::connect(connection_str))
        .context("Failed to establish PostgreSQL connection")
}

struct ControlFile {
    filename: String,
    contents: String,
}

struct InstallFile {
    filename: String,
    version: String,
    body: String,
}

struct UpgradeFile {
    filename: String,
    from_version: String,
    to_version: String,
    body: String,
}

struct Payload {
    extension_name: String,
    comment: Option<String>,
    install_files: Vec<InstallFile>,
    upgrade_files: Vec<UpgradeFile>,
}

fn install(rt: &Runtime, payload: &Payload, mut conn: PgConnection) -> anyhow::Result<()> {
    for install_file in &payload.install_files {
        let task = sqlx::query("select 1 from pgtle.install_extension($1, $2, $3, $4)")
            .bind(&payload.extension_name)
            .bind(&install_file.version)
            .bind(&payload.comment)
            .bind(&install_file.body)
            .execute(&mut conn);

        rt.block_on(task).context(format!(
            "failed to install extension version {}",
            install_file.filename
        ))?;
    }

    for upgrade_file in &payload.upgrade_files {
        let task = sqlx::query("select 1 from pgtle.install_update_path($1, $2, $3, $4)")
            .bind(&payload.extension_name)
            .bind(&upgrade_file.from_version)
            .bind(&upgrade_file.to_version)
            .bind(&upgrade_file.body)
            .execute(&mut conn);

        rt.block_on(task).context(format!(
            "failed to install extension version {}",
            upgrade_file.filename
        ))?;
    }

    Ok(())
}

fn uninstall(rt: &Runtime, extension_name: &str, mut conn: PgConnection) -> anyhow::Result<()> {
    let task = sqlx::query("select 1 from pgtle.uninstall_extension($1)")
        .bind(extension_name)
        .execute(&mut conn);

    rt.block_on(task)
        .context(format!("failed to uninstall extension {}", extension_name))?;
    Ok(())
}

impl Payload {
    fn from_pathbuf(path: &PathBuf) -> anyhow::Result<Self> {
        // Install from Path
        let abs_path = match fs::canonicalize(path) {
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
            0 => return Err(anyhow::anyhow!("no control file detected")),
            1 => control_files
                .pop()
                .context("failed to reference control file")?,
            _ => return Err(anyhow::anyhow!("multiple control files detected")),
        };

        // some_ext
        let control_file = ControlFile::from_pathbuf(&control_file_path)?;

        let extension_name = control_file.extension_name()?;

        if !is_valid_extension_name(&extension_name) {
            return Err(anyhow::anyhow!(
                "invalid extension name detected {}",
                extension_name
            ));
        }

        // TODO: follow the some_ext.control `directory` parameter allowing sql scripts to
        // be somewhere other than the repo root
        let mut install_files = vec![];
        let mut upgrade_files = vec![];

        for path in sql_files {
            let file_name = path.file_name().map(OsStr::to_str).flatten().unwrap();
            let parts: Vec<&str> = file_name
                .strip_suffix(".sql")
                .unwrap()
                .split("--")
                .collect();
            match &parts[..] {
                [file_ext_name, ver] => {
                    // Make sure the file's extension name matches the control file
                    if file_ext_name == &extension_name && is_valid_version(ver) {
                        let ifile = InstallFile {
                            filename: file_name.to_string(),
                            version: ver.to_string(),
                            body: fs::read_to_string(&path)
                                .context(format!("Failed to read file {}", &file_name))?,
                        };
                        install_files.push(ifile);
                    }
                }
                [file_ext_name, from_ver, to_ver] => {
                    // Make sure the file's extension name matches the control file
                    if file_ext_name == &extension_name
                        && is_valid_version(from_ver)
                        && is_valid_version(to_ver)
                    {
                        let ufile = UpgradeFile {
                            filename: file_name.to_string(),
                            from_version: from_ver.to_string(),
                            to_version: to_ver.to_string(),
                            body: fs::read_to_string(&path)
                                .context(format!("Failed to read file {}", &file_name))?,
                        };
                        upgrade_files.push(ufile);
                    }
                }
                _ => (),
            }
        }

        let payload = Payload {
            extension_name: extension_name.to_string(),
            comment: control_file.comment()?,
            install_files,
            upgrade_files,
        };
        Ok(payload)
    }
}

impl ControlFile {
    fn from_pathbuf(path: &PathBuf) -> anyhow::Result<Self> {
        let control_file_name = path
            .file_name()
            .map(OsStr::to_str)
            .flatten()
            .context("failed to read control file name")?
            .to_string();

        let control_file_body = fs::read_to_string(path).context("failed to read control file")?;

        Ok(Self {
            filename: control_file_name,
            contents: control_file_body,
        })
    }

    fn extension_name(&self) -> anyhow::Result<String> {
        self.filename
            .strip_suffix(".control")
            .context("failed to read extension name from control file")
            .map(str::to_string)
    }

    fn comment(&self) -> anyhow::Result<Option<String>> {
        for line in self.contents.lines() {
            if line.starts_with("comment") {
                return Ok(Some(self.read_control_line_value(line)?));
            }
        }
        Ok(None)
    }

    fn read_control_line_value(&self, line: &str) -> anyhow::Result<String> {
        let parts: Vec<&str> = line.split("=").collect();
        match &parts[..] {
            [_, value] => {
                let mut base_value = value.trim();
                base_value = base_value.strip_prefix("'").unwrap_or(base_value);
                base_value = base_value.strip_suffix("'").unwrap_or(base_value);
                Ok(base_value.to_string())
            }
            _ => Err(anyhow::anyhow!("invalid line in control file")),
        }
    }
}
