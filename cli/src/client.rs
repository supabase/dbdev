use anyhow::Context;
use serde::{Deserialize, Serialize};
use url::Url;

use crate::{config::Registry, secret::Secret};

pub struct ApiClient<'a> {
    base_url: &'a Url,
    api_key: &'a str,
    http_client: reqwest::Client,
}

impl<'a> ApiClient<'a> {
    pub(crate) fn from_registry(registry: &'a Registry) -> anyhow::Result<Self> {
        Ok(Self::new(&registry.base_url, &registry.api_key))
    }

    fn new(base_url: &'a Url, api_key: &'a str) -> Self {
        Self {
            base_url,
            api_key,
            http_client: reqwest::Client::new(),
        }
    }

    /// Redeems the access token for a shorter lived jwt token
    pub async fn redeem_access_token(&self, jwt: Secret<String>) -> anyhow::Result<Secret<String>> {
        let url = format!("{}/rest/v1/rpc/redeem_access_token", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", self.api_key)
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
            .header("apiKey", self.api_key)
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
    ) -> anyhow::Result<Option<uuid::Uuid>> {
        let url = format!("{}/rest/v1/rpc/publish_package_version", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", self.api_key)
            .header("Authorization", format!("Bearer {}", jwt.expose()))
            .json(&request)
            .send()
            .await
            .context("failed to call publish package version endpoint")?;

        let status = response.status();
        if !status.is_success() {
            return Err(anyhow::anyhow!(response.text().await?));
        }

        let version_id = response
            .json::<Option<uuid::Uuid>>()
            .await
            .context("Failed to parse version id")?;

        Ok(version_id)
    }

    pub async fn publish_package_upgrade(
        &self,
        jwt: &Secret<String>,
        request: &PublishPackageUpgradeRequest<'_>,
    ) -> anyhow::Result<Option<uuid::Uuid>> {
        let url = format!("{}/rest/v1/rpc/publish_package_upgrade", self.base_url);
        let response = self
            .http_client
            .post(&url)
            .header("apiKey", self.api_key)
            .header("Authorization", format!("Bearer {}", jwt.expose()))
            .json(&request)
            .send()
            .await
            .context("failed to call publish package upgrade endpoint")?;

        let status = response.status();

        if !status.is_success() {
            return Err(anyhow::anyhow!(response.text().await?));
        }

        let upgrade_id = response
            .json::<Option<uuid::Uuid>>()
            .await
            .context("Failed to parse upgrade id")?;

        Ok(upgrade_id)
    }

    pub async fn get_latest_package_version(
        &self,
        package_name: &str,
    ) -> anyhow::Result<Vec<GetLatestPackageVersionResponse>> {
        let url = format!("{}/rest/v1/package_versions", self.base_url);
        let response = self
            .http_client
            .get(url)
            .query(&[
                (
                    "select",
                    "package_name,version,sql,control_description,control_requires",
                ),
                (
                    "or",
                    &format!("(package_name.eq.{package_name},package_alias.eq.{package_name})"),
                ),
                ("order", "version.desc"),
                ("limit", "1"),
            ])
            .header("apiKey", self.api_key)
            .send()
            .await
            .context("failed to get package version")?;

        let status = response.status();

        if !status.is_success() {
            return Err(anyhow::anyhow!(response.text().await?));
        }

        let latest_version = response
            .json::<Vec<GetLatestPackageVersionResponse>>()
            .await
            .context("Failed to parse latest version response")?;

        Ok(latest_version)
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserMetadata {
    handle: String,
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
    pub relocatable: bool,
    pub requires: &'a [String],
    pub default_version: &'a str,
}

#[derive(Serialize)]
pub struct PublishPackageVersionRequest<'a> {
    pub package_name: &'a str,
    pub version: &'a str,
    pub version_source: &'a str,
    pub version_description: &'a str,
}

#[derive(Serialize)]
pub struct PublishPackageUpgradeRequest<'a> {
    pub package_name: &'a str,
    pub from_version: &'a str,
    pub to_version: &'a str,
    pub upgrade_source: &'a str,
}

#[derive(Debug, Deserialize)]
pub struct GetLatestPackageVersionResponse {
    pub package_name: String,
    pub version: String,
    pub sql: String,
    pub control_description: String,
    pub control_requires: Vec<String>,
}
