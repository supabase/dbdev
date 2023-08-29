use anyhow::anyhow;
use dirs::home_dir;
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
        let credentials_file = dbdev_dir.join("credentials.toml");
        let json = serde_json::to_string(access_token)?;
        tokio::fs::write(&credentials_file, json).await?;
    } else {
        return Err(anyhow!("Failed to find home directory"));
    }

    Ok(())
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