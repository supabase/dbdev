use anyhow::Context;
//use postgrest::Postgrest;
use serde::{Deserialize, Serialize};
use tokio::fs::File;
use tokio::io::AsyncReadExt;

use crate::secret::Secret;

pub struct APIClient {
    base_url: String,
    api_key: String,
    //api_client: Postgrest,
    http_client: reqwest::Client,
}

impl APIClient {
    pub fn new(base_url: &str, api_key: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            api_key: api_key.to_string(),
            //api_client: Postgrest::new(format!("{base_url}/rest/v1/"))
            //.insert_header("apiKey", api_key),
            http_client: reqwest::Client::new(),
        }
    }

    pub async fn create_user(
        &self,
        email: &str,
        password: &str,
        handle: &str,
    ) -> anyhow::Result<SignupResponse> {
        let user = User {
            email: email.to_string(),
            password: password.to_string(),
            data: UserMetadata {
                handle: handle.to_string(),
            },
        };

        let url = format!("{}/auth/v1/signup", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", &self.api_key)
            .json(&user)
            .send()
            .await
            .context("failed to create user")?;

        if response.status() != 200 {
            return Err(anyhow::anyhow!(response.text().await?));
        }

        let resp = response.json::<SignupResponse>().await?;
        Ok(resp)
    }

    /// Redeems the access token for a shorter lived jwt token
    pub async fn redeem_access_token(
        &self,
        access_token: Secret<String>,
    ) -> anyhow::Result<Secret<String>> {
        let url = format!("{}/rest/v1/rpc/redeem_access_token", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", &self.api_key)
            .json(&serde_json::json!( {
                "access_token": access_token.expose(),
            }))
            .send()
            .await
            .context("failed to get access token")?;

        if response.status() != 200 {
            return Err(anyhow::anyhow!(response.text().await?));
        }

        let resp = response.json::<Secret<String>>().await?;
        Ok(resp)
    }

    pub async fn upload_package(
        &self,
        handle: &str,
        payload: &crate::models::Payload,
        jwt: &Secret<String>,
    ) -> anyhow::Result<()> {
        let mut files = vec![];

        let dirpath = payload
            .abs_path
            .clone()
            .context("Expected payload file path")?;
        for install_file in &payload.install_files {
            let filepath = dirpath.join(&install_file.filename);
            let mut file = File::open(filepath).await?;
            let mut file_buffer = Vec::new();
            file.read_to_end(&mut file_buffer).await?;

            let url = format!(
                "{}/storage/v1/object/package_versions/{}-{}",
                self.base_url, &handle, &install_file.filename
            );

            println!("{}", url);

            let response = self
                .http_client
                .post(&url)
                .header("ContentType", "text/plain")
                .header("Authorization", &format!("Bearer {}", jwt.expose()))
                .header("apiKey", &self.api_key)
                .body(file_buffer)
                .send()
                .await
                .context("failed to upload artifact")?;

            if response.status() != 200 {
                return Err(anyhow::anyhow!(response.text().await?));
            }

            println!(
                "{:?}",
                response.json::<serde_json::Value>().await?.to_string()
            );

            files.push(file);
        }

        for upgrade_file in &payload.upgrade_files {
            let filepath = dirpath.join(&upgrade_file.filename);
            let mut file = File::open(filepath).await?;
            let mut file_buffer = Vec::new();
            file.read_to_end(&mut file_buffer).await?;

            let url = format!(
                "{}/storage/v1/object/package_upgrades/{}-{}",
                self.base_url, &handle, &upgrade_file.filename
            );

            println!("{}", url);

            let response = self
                .http_client
                .post(&url)
                .header("ContentType", "text/plain")
                .header("Authorization", &format!("Bearer {}", jwt.expose()))
                .header("apiKey", &self.api_key)
                .body(file_buffer)
                .send()
                .await
                .context("failed to upload artifact")?;

            if response.status() != 200 {
                return Err(anyhow::anyhow!(response.text().await?));
            }

            files.push(file);
        }

        // TODO: add upgrade pathes
        // TODO: call the SQL RPC to finialize the package

        Ok(())
    }
}

#[derive(Serialize, Debug)]
struct User {
    email: String,
    password: String,
    data: UserMetadata,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserMetadata {
    handle: String,
}

#[derive(Deserialize, Debug)]
pub struct SignupResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: SignupResponseUser,
}

#[derive(Deserialize, Debug)]
pub struct SignupResponseUser {
    pub email: String,
    pub id: uuid::Uuid,
    pub user_metadata: UserMetadata,
}

#[derive(Deserialize, Debug)]
pub enum TokenType {
    #[serde(alias = "bearer")]
    Bearer,
}
