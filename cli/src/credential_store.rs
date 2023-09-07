use anyhow::anyhow;
use dirs::home_dir;
use std::io::Write;
use tokio::fs::create_dir;

use crate::secret::Secret;

pub(crate) fn get_secret_from_stdin() -> anyhow::Result<Secret<String>> {
    let secret = rpassword::prompt_password("Please paste the token found on database.dev: ")?;
    Ok(Secret::from(secret))
}

pub(crate) async fn save_access_token(access_token: &Secret<String>) -> anyhow::Result<()> {
    if let Some(home_dir) = home_dir() {
        let dbdev_dir = home_dir.join(".dbdev");
        if !dbdev_dir.exists() {
            create_dir(&dbdev_dir).await?;
        }
        let credentials_file_path = dbdev_dir.join("credentials.toml");
        let json = serde_json::to_string(access_token)?;
        let mut credentials_file = create_file(&credentials_file_path)?;
        credentials_file.write_all(json.as_bytes())?;
    } else {
        return Err(anyhow!("Failed to find home directory"));
    }

    Ok(())
}

use std::fs::{File, OpenOptions};
use std::path::Path;

#[cfg(target_family = "unix")]
fn create_file(path: &Path) -> anyhow::Result<File> {
    use std::os::unix::fs::OpenOptionsExt;

    let mut options = OpenOptions::new();
    // read/write permissions for owner, none for other
    options.create(true).write(true).mode(0o600);
    Ok(options.open(path)?)
}

#[cfg(not(target_family = "unix"))]
fn create_file(path: &Path) -> anyhow::Result<File> {
    let mut options = OpenOptions::new();
    options.create(true).write(true);
    Ok(options.open(path)?)
}

pub(crate) async fn read_access_token() -> anyhow::Result<Secret<String>> {
    if let Some(home_dir) = home_dir() {
        let dbdev_dir = home_dir.join(".dbdev");
        let credentials_file = dbdev_dir.join("credentials.toml");
        let raw_access_token = tokio::fs::read_to_string(&credentials_file).await?;
        let access_token = serde_json::from_str(&raw_access_token)?;
        Ok(access_token)
    } else {
        Err(anyhow!("Failed to find home directory"))
    }
}
