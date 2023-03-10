use anyhow::Context;
use sqlx::postgres::PgConnection;
use sqlx::Connection;
use tokio::runtime::Runtime;

pub fn get_connection(rt: &Runtime, connection_str: &str) -> anyhow::Result<PgConnection> {
    rt.block_on(PgConnection::connect(connection_str))
        .context("Failed to establish PostgreSQL connection")
}

pub fn is_valid_extension_name(_name: &str) -> bool {
    true
}

pub fn is_valid_version(_version: &str) -> bool {
    true
}
