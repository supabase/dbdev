use crate::client;
use crate::credentil_store::read_access_token;
use crate::models::Payload;

pub async fn publish(
    client: &client::APIClient,
    payload: &Payload,
    handle: &str,
) -> anyhow::Result<()> {
    let access_token = read_access_token().await?;
    let jwt = client.redeem_access_token(access_token).await?;

    client.upload_package(handle, payload, &jwt).await?;

    Ok(())
}
