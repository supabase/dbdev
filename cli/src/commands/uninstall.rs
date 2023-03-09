use anyhow::Context;
use sqlx::postgres::PgConnection;
use tokio::runtime::Runtime;

pub fn uninstall(rt: &Runtime, extension_name: &str, mut conn: PgConnection) -> anyhow::Result<()> {
    let task = sqlx::query("select 1 from pgtle.uninstall_extension($1)")
        .bind(extension_name)
        .execute(&mut conn);

    rt.block_on(task)
        .context(format!("failed to uninstall extension {}", extension_name))?;
    Ok(())
}
