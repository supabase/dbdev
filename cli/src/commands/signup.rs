use crate::client;
use anyhow::Context;

pub async fn signup(
    client: &client::APIClient,
    email: &str,
    password: &str,
    handle: &str,
) -> anyhow::Result<()> {
    /*
    let is_available = client
        .is_handle_available(handle)
        .await
        .context("failed to check handle availability")?;

    if !is_available {
        return Err(anyhow::anyhow!(
            "requested handle '{handle}' is not available"
        ));
    }
    */

    let response = client.create_user(email, password, handle).await?;

    println!("{:?}", response.to_string());

    Ok(())
}
