use anyhow::Context;
use sqlx::postgres::PgConnection;
use sqlx::Connection;

pub async fn get_connection(connection_str: &str) -> anyhow::Result<PgConnection> {
    PgConnection::connect(connection_str)
        .await
        .context("Failed to establish PostgreSQL connection")
}

pub fn is_valid_extension_name(_name: &str) -> bool {
    true
}

pub fn is_valid_version(_version: &str) -> bool {
    true
}
