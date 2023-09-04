use std::{
    collections::HashMap,
    fs::{self, create_dir},
    io::Write,
    path::Path,
};

use dirs::home_dir;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use url::Url;

use crate::util::create_file;

#[derive(Serialize, Deserialize)]
pub(crate) struct Config {
    pub(crate) registries: HashMap<String, Registry>,
    #[serde(rename = "registry")]
    pub(crate) default_registry: DefaultRegistry,
}

#[derive(Serialize, Deserialize)]
pub(crate) struct Registry {
    pub(crate) base_url: Url,
    pub(crate) api_key: String,
}

#[derive(Serialize, Deserialize)]
pub(crate) struct DefaultRegistry {
    pub(crate) name: String,
}

#[cfg(debug_assertions)]
impl Default for Config {
    fn default() -> Self {
        let mut registries = HashMap::new();
        let registry_name = "localhost";
        registries.insert(
            registry_name.to_string(),
            Registry {
                base_url: url::Url::parse("http://localhost:54321")
                    .expect("Failed to parse localhost url"),
                api_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0".to_string(),
            },
        );
        let default_registry = DefaultRegistry {
            name: registry_name.to_string(),
        };
        Self {
            registries,
            default_registry,
        }
    }
}

#[cfg(not(debug_assertions))]
impl Default for Config {
    fn default() -> Self {
        let mut registries = HashMap::new();
        let registry_name = "dbdev";
        registries.insert(
            registry_name.to_string(),
            Registry {
                base_url: url::Url::parse("https://database.dev")
                    .expect("Failed to parse database.dev url"),
                api_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXB0cHBsZnZpaWZyYndtbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAxMDczNzIsImV4cCI6MTk5NTY4MzM3Mn0.z2CN0mvO2No8wSi46Gw59DFGCTJrzM0AQKsu_5k134s".to_string(),
            },
        );
        let default_registry = DefaultRegistry {
            name: registry_name.to_string(),
        };
        Self {
            registries,
            default_registry,
        }
    }
}

#[derive(Error, Debug)]
pub(crate) enum FindRegistryError {
    #[error("registry not found: {0}")]
    NotFound(String),
}

#[derive(Error, Debug)]
pub(crate) enum ConfigReadError {
    #[error("config file missing")]
    ConfigFileMissing,

    #[error("error reading config file")]
    Io(#[from] std::io::Error),

    #[error("error parsing toml from config file")]
    Toml(#[from] toml::de::Error),
}

#[derive(Error, Debug)]
pub(crate) enum ConfigWriteError {
    #[error("error reading config file")]
    Io(#[from] std::io::Error),

    #[error("error converting config into toml")]
    Toml(#[from] toml::ser::Error),
}

impl Config {
    pub(crate) fn get_registry(&self) -> Result<&Registry, FindRegistryError> {
        match self.registries.get(&self.default_registry.name) {
            Some(registry) => Ok(registry),
            None => Err(FindRegistryError::NotFound(format!(
                "registry `{}` not found",
                self.default_registry.name
            ))),
        }
    }

    pub(crate) fn read_from_default_file() -> anyhow::Result<Config> {
        if let Err(ConfigReadError::ConfigFileMissing) = Self::read_from_file("config.toml") {
            Self::create_default_config()?;
        }
        Ok(Self::read_from_file("config.toml")?)
    }

    fn read_from_file<P: AsRef<Path>>(file_path: P) -> Result<Config, ConfigReadError> {
        if let Some(home_dir) = home_dir() {
            let dbdev_dir = home_dir.join(".dbdev");
            if !dbdev_dir.exists() {
                return Err(ConfigReadError::ConfigFileMissing);
            }
            let config_file_path = dbdev_dir.join(file_path);
            if !config_file_path.exists() {
                return Err(ConfigReadError::ConfigFileMissing);
            }
            let config_str = fs::read_to_string(config_file_path)?;
            Ok(toml::from_str::<Config>(&config_str)?)
        } else {
            panic!("Home directory could not be found");
        }
    }

    fn create_default_config() -> Result<(), ConfigWriteError> {
        if let Some(home_dir) = home_dir() {
            let dbdev_dir = home_dir.join(".dbdev");
            if !dbdev_dir.exists() {
                create_dir(&dbdev_dir)?;
            }
            let default_config = Config::default();
            let config_str = toml::to_string(&default_config)?;
            let config_file_path = dbdev_dir.join("config.toml");
            let mut config_file = create_file(&config_file_path)?;
            config_file.write_all(config_str.as_bytes())?;
            Ok(())
        } else {
            panic!("Home directory could not be found");
        }
    }
}
