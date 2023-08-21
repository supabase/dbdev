use anyhow::anyhow;
use dirs::home_dir;
use tokio::fs::create_dir;

use crate::secret::Secret;

pub async fn login() -> anyhow::Result<()> {
    let secret = rpassword::prompt_password("Please paste the token found on database.dev: ")?;
    let secret = Secret::from(secret);
    save_secret(&secret).await?;
    Ok(())
}

async fn save_secret(secret: &Secret<String>) -> anyhow::Result<()> {
    if let Some(home_dir) = home_dir() {
        let dbdev_dir = home_dir.join(".dbdev");
        if !dbdev_dir.exists() {
            create_dir(&dbdev_dir).await?;
        }
        let credentials_file = dbdev_dir.join("credentials.toml");
        let json = serde_json::to_string(secret)?;
        tokio::fs::write(&credentials_file, json).await?;
    } else {
        return Err(anyhow!("Failed to find home directory"));
    }

    Ok(())
}
