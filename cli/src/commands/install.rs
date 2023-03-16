use crate::models::Payload;
use anyhow::Context;
use sqlx::postgres::PgConnection;

pub async fn install(payload: &Payload, mut conn: PgConnection) -> anyhow::Result<()> {
    for install_file in &payload.install_files {
        sqlx::query("select pgtle.install_extension($1, $2, $3, $4, $5)")
            .bind(&payload.metadata.extension_name)
            .bind(&install_file.version)
            .bind(&payload.metadata.comment)
            .bind(&install_file.body)
            .bind(&payload.metadata.requires)
            .execute(&mut conn)
            .await
            .context(format!(
                "failed to install extension version {}",
                install_file.filename
            ))?;
    }

    for upgrade_file in &payload.upgrade_files {
        sqlx::query("select pgtle.install_update_path($1, $2, $3, $4)")
            .bind(&payload.metadata.extension_name)
            .bind(&upgrade_file.from_version)
            .bind(&upgrade_file.to_version)
            .bind(&upgrade_file.body)
            .execute(&mut conn)
            .await
            .context(format!(
                "failed to install extension version {}",
                upgrade_file.filename
            ))?;
    }

    sqlx::query("select pgtle.set_default_version($1, $2)")
        .bind(&payload.metadata.extension_name)
        .bind(&payload.metadata.default_version)
        .execute(&mut conn)
        .await
        .context(format!(
            "failed to set default version to {}",
            &payload.metadata.default_version
        ))?;

    Ok(())
}
