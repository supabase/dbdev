use anyhow::Context;
use regex::Regex;
use sqlx::postgres::PgConnection;
use sqlx::Connection;
use std::fs::{File, OpenOptions};
use std::path::Path;

pub async fn get_connection(connection_str: &str) -> anyhow::Result<PgConnection> {
    PgConnection::connect(connection_str)
        .await
        .context("Failed to establish PostgreSQL connection")
}

pub fn is_valid_extension_name(name: &str) -> bool {
    let name_regex = Regex::new(r"^[A-z][A-z0-9\_]{2,32}$").expect("regex is valid");
    name_regex.is_match(name)
}

pub fn is_valid_version(version: &str) -> bool {
    let nums: Vec<&str> = version.split('.').collect();
    if nums.len() != 3 {
        println!("1");
        return false;
    }

    for num_str in nums {
        let num: i16 = match num_str.parse() {
            Ok(n) => n,
            _ => return false,
        };
        if num < 0 {
            return false;
        }
    }

    true
}

#[cfg(target_family = "unix")]
pub(crate) fn create_file(path: &Path) -> Result<File, std::io::Error> {
    use std::os::unix::fs::OpenOptionsExt;

    let mut options = OpenOptions::new();
    // read/write permissions for owner, none for other
    options.create(true).write(true).mode(0o600);
    options.open(path)
}

#[cfg(not(target_family = "unix"))]
pub(crate) fn create_file(path: &Path) -> Result<File, std::io::Error> {
    let mut options = OpenOptions::new();
    options.create(true).write(true);
    options.open(path)
}
