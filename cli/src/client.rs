use anyhow::Context;
use postgrest::Postgrest;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub struct APIClient {
    base_url: String,
    api_key: String,
    api_client: Postgrest,
    http_client: reqwest::Client,
}

impl APIClient {
    pub fn new(base_url: &str, api_key: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            api_key: api_key.to_string(),
            api_client: Postgrest::new(format!("{base_url}/rest/v1/"))
                .insert_header("apiKey", api_key),
            http_client: reqwest::Client::new(),
        }
    }

    pub async fn is_handle_available(&self, handle: &str) -> anyhow::Result<bool> {
        let mut args = HashMap::new();
        args.insert("handle", handle);
        let response = self
            .api_client
            .rpc("is_handle_available", serde_json::json!(args).to_string())
            .execute()
            .await
            .context("Failed to check handle availability")?;

        match response.status().into() {
            200 => {
                let data = response.text().await.context("Failed to get text")?;
                let is_avail: bool = data.parse().context("failed to parse bool")?;
                Ok(is_avail)
            }
            x => Err(anyhow::anyhow!("non-200 response {x}")),
        }
    }

    pub async fn create_user(
        &self,
        email: &str,
        password: &str,
        handle: &str,
    ) -> anyhow::Result<serde_json::Value> {
        let user = User {
            email: email.to_string(),
            password: password.to_string(),
            data: [("handle".to_string(), handle.to_string())]
                .into_iter()
                .collect(),
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

        //let resp = response.json::<SignupResponse>().await?;
        let resp = response.json::<serde_json::Value>().await?;
        //.context("failed to parse create user json response")?;
        Ok(resp)
    }
}

#[derive(Serialize)]
struct User {
    email: String,
    password: String,
    data: HashMap<String, String>,
}

#[derive(Deserialize, Debug)]
pub struct SignupResponse {
    pub email: String,
    pub access_token: String,
}
