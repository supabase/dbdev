use anyhow::Context;
//use postgrest::Postgrest;
use serde::{Deserialize, Serialize};

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
    pub async fn redeem_access_token(&self, jwt: Secret<String>) -> anyhow::Result<Secret<String>> {
        let url = format!("{}/rest/v1/rpc/redeem_access_token", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", &self.api_key)
            .json(&serde_json::json!( {
                "access_token": jwt.expose(),
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

    pub async fn publish_package(
        &self,
        jwt: &Secret<String>,
        request: &PublishPackageRequest<'_>,
    ) -> anyhow::Result<()> {
        let url = format!("{}/rest/v1/rpc/publish_package", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", &self.api_key)
            .header("Authorization", format!("Bearer {}", jwt.expose()))
            .json(&request)
            .send()
            .await
            .context("failed to call publish package endpoint")?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(response.text().await?));
        }

        Ok(())
    }

    pub async fn publish_package_version(
        &self,
        jwt: &Secret<String>,
        request: &PublishPackageVersionRequest<'_>,
    ) -> anyhow::Result<()> {
        let url = format!("{}/rest/v1/rpc/publish_package_version", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", &self.api_key)
            .header("Authorization", format!("Bearer {}", jwt.expose()))
            .json(&request)
            .send()
            .await
            .context("failed to call publish package version endpoint")?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(response.text().await?));
        }

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

#[derive(Serialize)]
pub struct PublishPackageRequest<'a> {
    pub package_name: &'a str,
    pub package_description: &'a Option<String>,
}

#[derive(Serialize)]
pub struct PublishPackageVersionRequest<'a> {
    pub package_name: &'a str,
    pub version: &'a str,
    pub version_source: &'a str,
    pub version_description: &'a str,
}
