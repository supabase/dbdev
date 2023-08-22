use crate::credentil_store::{get_secret_from_stdin, save_access_token};

pub async fn login() -> anyhow::Result<()> {
    let secret = get_secret_from_stdin()?;
    save_access_token(&secret).await?;
    Ok(())
}
