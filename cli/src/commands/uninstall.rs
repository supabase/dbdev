use anyhow::Context;
use sqlx::postgres::PgConnection;

pub async fn uninstall(extension_name: &str, mut conn: PgConnection) -> anyhow::Result<()> {
    sqlx::query("select 1 from pgtle.uninstall_extension($1)")
        .bind(extension_name)
        .execute(&mut conn)
        .await
        .context(format!("failed to uninstall extension {}", extension_name))?;

    Ok(())
}
