use crate::client;
use crate::models::Payload;

pub async fn publish(
    client: &client::APIClient,
    payload: &Payload,
    email: &str,
    password: &str,
    handle: &str,
) -> anyhow::Result<()> {
    let token = client.get_access_token(email, password).await?;

    client.upload_package(handle, payload, &token).await?;

    Ok(())
}
