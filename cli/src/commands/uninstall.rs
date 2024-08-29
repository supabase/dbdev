use anyhow::Context;
use sqlx::postgres::{PgConnection, PgRow};
use sqlx::Row;

pub async fn uninstall(extension_name: &str, mut conn: PgConnection) -> anyhow::Result<()> {
    let quoted_extension_name: String = sqlx::query("select quote_ident($1) as ident")
        .bind(extension_name)
        .map(|row: PgRow| row.get("ident"))
        .fetch_one(&mut conn)
        .await
        .context("Failed to get quoted identifier")?;

    sqlx::query(&format!("drop extension if exists {quoted_extension_name}"))
        .execute(&mut conn)
        .await
        .context(format!("failed to drop extension {}", extension_name))?;

    sqlx::query("select 1 from pgtle.uninstall_extension($1)")
        .bind(extension_name)
        .execute(&mut conn)
        .await
        .context(format!("failed to uninstall extension {}", extension_name))?;

    Ok(())
}
