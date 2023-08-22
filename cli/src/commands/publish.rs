use crate::client::{self, PublishPackageRequest};
use crate::credentil_store::read_access_token;
use crate::models::Payload;

pub async fn publish(client: &client::APIClient, payload: &Payload) -> anyhow::Result<()> {
    let access_token = read_access_token().await?;
    let jwt = client.redeem_access_token(access_token).await?;

    let request = create_publish_package_request(&payload);
    client.publish_package(&jwt, &request).await?;

    Ok(())
}

fn create_publish_package_request(payload: &Payload) -> PublishPackageRequest {
    PublishPackageRequest {
        package_name: &payload.metadata.extension_name,
        package_description: &payload.metadata.comment,
    }
}

// async fn publish_package(
//     handle: &str,
//     payload: &crate::models::Payload,
//     jwt: &Secret<String>,
// ) -> anyhow::Result<()> {
//     let mut files = vec![];

//     let dirpath = payload
//         .abs_path
//         .clone()
//         .context("Expected payload file path")?;
//     for install_file in &payload.install_files {
//         let filepath = dirpath.join(&install_file.filename);
//         let mut file = File::open(filepath).await?;
//         let mut file_buffer = Vec::new();
//         file.read_to_end(&mut file_buffer).await?;

//         let url = format!(
//             "{}/storage/v1/object/package_versions/{}-{}",
//             self.base_url, &handle, &install_file.filename
//         );

//         println!("{}", url);

//         let response = self
//             .http_client
//             .post(&url)
//             .header("ContentType", "text/plain")
//             .header("Authorization", &format!("Bearer {}", jwt.expose()))
//             .header("apiKey", &self.api_key)
//             .body(file_buffer)
//             .send()
//             .await
//             .context("failed to upload artifact")?;

//         if response.status() != 200 {
//             return Err(anyhow::anyhow!(response.text().await?));
//         }

//         println!(
//             "{:?}",
//             response.json::<serde_json::Value>().await?.to_string()
//         );

//         files.push(file);
//     }

//     for upgrade_file in &payload.upgrade_files {
//         let filepath = dirpath.join(&upgrade_file.filename);
//         let mut file = File::open(filepath).await?;
//         let mut file_buffer = Vec::new();
//         file.read_to_end(&mut file_buffer).await?;

//         let url = format!(
//             "{}/storage/v1/object/package_upgrades/{}-{}",
//             self.base_url, &handle, &upgrade_file.filename
//         );

//         println!("{}", url);

//         let response = self
//             .http_client
//             .post(&url)
//             .header("ContentType", "text/plain")
//             .header("Authorization", &format!("Bearer {}", jwt.expose()))
//             .header("apiKey", &self.api_key)
//             .body(file_buffer)
//             .send()
//             .await
//             .context("failed to upload artifact")?;

//         if response.status() != 200 {
//             return Err(anyhow::anyhow!(response.text().await?));
//         }

//         files.push(file);
//     }

//     // TODO: add upgrade pathes
//     // TODO: call the SQL RPC to finialize the package

//     Ok(())
// }
