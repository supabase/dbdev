use std::{
    collections::HashMap,
    fs::{create_dir, read_to_string},
    io::Write,
};

use anyhow::anyhow;
use dirs::home_dir;
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::{secret::Secret, util::create_file};

#[derive(Serialize, Deserialize)]
pub(crate) struct Credentials {
    #[serde(rename = "registries")]
    pub(crate) tokens: HashMap<String, Token>,
}

#[derive(Serialize, Deserialize)]
pub(crate) struct Token {
    #[serde(rename = "token")]
    pub(crate) value: String,
}

#[derive(Error, Debug)]
pub(crate) enum FindTokenError {
    #[error("token not found: {0}")]
    NotFound(String),
}

#[derive(Error, Debug)]
pub(crate) enum CredentialsReadError {
    #[error("credentials file missing")]
    CredentialsFileMissing,

    #[error("error reading credentials file")]
    Io(#[from] std::io::Error),

    #[error("error parsing toml from credentials file")]
    Toml(#[from] toml::de::Error),
}

pub(crate) fn get_secret_from_stdin() -> anyhow::Result<Secret<String>> {
    let secret = rpassword::prompt_password("Please paste the token found on database.dev: ")?;
    Ok(Secret::from(secret))
}

impl Credentials {
    pub(crate) fn get_token(&self, registry_name: &str) -> Result<&Token, FindTokenError> {
        match self.tokens.get(registry_name) {
            Some(token) => Ok(token),
            None => Err(FindTokenError::NotFound(format!(
                "token for registry `{}` not found",
                registry_name
            ))),
        }
    }

    pub(crate) fn write(registry_name: &str, access_token: &Secret<String>) -> anyhow::Result<()> {
        if let Some(home_dir) = home_dir() {
            let dbdev_dir = home_dir.join(".dbdev");
            if !dbdev_dir.exists() {
                create_dir(&dbdev_dir)?;
            }

            let mut credentials = Self::read_or_create_credentials()?;
            let token = Token {
                value: access_token.expose().clone(),
            };
            credentials.tokens.insert(registry_name.to_string(), token);
            let credentials_str = toml::to_string(&credentials)?;

            let credentials_file_path = dbdev_dir.join("credentials.toml");
            let mut credentials_file = create_file(&credentials_file_path)?;
            credentials_file.write_all(credentials_str.as_bytes())?;
        } else {
            return Err(anyhow!("Failed to find home directory"));
        }

        Ok(())
    }

    pub(crate) fn read() -> Result<Credentials, CredentialsReadError> {
        if let Some(home_dir) = home_dir() {
            let dbdev_dir = home_dir.join(".dbdev");
            if !dbdev_dir.exists() {
                return Err(CredentialsReadError::CredentialsFileMissing);
            }
            let credentials_file_path = dbdev_dir.join("credentials.toml");
            if !credentials_file_path.exists() {
                return Err(CredentialsReadError::CredentialsFileMissing);
            }
            let credentials_str = read_to_string(&credentials_file_path)?;
            let credentials = toml::from_str(&credentials_str)?;
            Ok(credentials)
        } else {
            panic!("Failed to find home directory");
        }
    }

    fn read_or_create_credentials() -> Result<Credentials, CredentialsReadError> {
        match Self::read() {
            Ok(credentials) => Ok(credentials),
            Err(CredentialsReadError::CredentialsFileMissing) => Ok(Credentials {
                tokens: HashMap::new(),
            }),
            e => e,
        }
    }
}
