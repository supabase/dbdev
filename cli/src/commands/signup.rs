use crate::client;
use anyhow::Context;

pub async fn signup(
    client: &client::APIClient,
    email: &str,
    password: &str,
    handle: &str,
) -> anyhow::Result<()> {
    let response = client.create_user(email, password, handle).await?;

    // TODO: save access and refresh token

    println!("{:?}", response);

    Ok(())
}
