use std::collections::HashSet;

use crate::models::Payload;
use anyhow::Context;
use futures::TryStreamExt;
use sqlx::postgres::PgConnection;

pub async fn install(payload: &Payload, mut conn: PgConnection) -> anyhow::Result<()> {
    let existing_versions = extension_versions(&mut conn, &payload.metadata.extension_name).await?;
    let mut versions_installed_now = HashSet::new();

    let mut installed_extension_once = !existing_versions.is_empty();

    for install_file in &payload.install_files {
        if !existing_versions.contains(&install_file.version) {
            if installed_extension_once {
                sqlx::query("select pgtle.install_extension_version_sql($1, $2, $3)")
                    .bind(&payload.metadata.extension_name)
                    .bind(&install_file.version)
                    .bind(&install_file.body)
                    .execute(&mut conn)
                    .await
                    .context(format!(
                        "failed to install extension version {}",
                        install_file.filename
                    ))?;
                println!("Installed version {}", install_file.version);
                versions_installed_now.insert(install_file.version.clone());
            } else {
                sqlx::query("select pgtle.install_extension($1, $2, $3, $4, $5)")
                    .bind(&payload.metadata.extension_name)
                    .bind(&install_file.version)
                    .bind(&payload.metadata.comment)
                    .bind(&install_file.body)
                    .bind(&payload.metadata.requires)
                    .execute(&mut conn)
                    .await
                    .context(format!(
                        "failed to install extension {}",
                        install_file.filename
                    ))?;
                println!("Installed version {}", install_file.version);
                versions_installed_now.insert(install_file.version.clone());
                installed_extension_once = true;
            }
        }
    }

    let existing_update_paths = update_paths(&mut conn, &payload.metadata.extension_name).await?;

    for upgrade_file in &payload.upgrade_files {
        if !existing_update_paths.contains(&UpdatePath {
            source: upgrade_file.from_version.clone(),
            target: upgrade_file.to_version.clone(),
        }) {
            sqlx::query("select pgtle.install_update_path($1, $2, $3, $4)")
                .bind(&payload.metadata.extension_name)
                .bind(&upgrade_file.from_version)
                .bind(&upgrade_file.to_version)
                .bind(&upgrade_file.body)
                .execute(&mut conn)
                .await
                .context(format!(
                    "failed to install update path {}",
                    upgrade_file.filename
                ))?;
            println!(
                "Installed update file from version {} to {}",
                upgrade_file.from_version, upgrade_file.to_version
            );
        }
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

    if !versions_installed_now.contains(&payload.metadata.default_version) {
        println!(
            "Set default version to {}",
            payload.metadata.default_version
        );
    }

    Ok(())
}

#[derive(sqlx::FromRow)]
struct ExtensionVersion {
    version: String,
}

async fn extension_versions(
    conn: &mut PgConnection,
    extension_name: &str,
) -> anyhow::Result<HashSet<String>> {
    let mut rows = sqlx::query_as::<_, ExtensionVersion>(
        "select version from pgtle.available_extension_versions() where name = $1",
    )
    .bind(extension_name)
    .fetch(conn);

    let mut versions = HashSet::new();
    while let Some(installed_version) = rows.try_next().await? {
        versions.insert(installed_version.version);
    }

    Ok(versions)
}

#[derive(sqlx::FromRow, PartialEq, Eq, Hash)]
pub(crate) struct UpdatePath {
    pub(crate) source: String,
    pub(crate) target: String,
}

pub(crate) async fn update_paths(
    conn: &mut PgConnection,
    extension_name: &str,
) -> anyhow::Result<HashSet<UpdatePath>> {
    let mut rows = sqlx::query_as::<_, UpdatePath>(
        "select source, target from pgtle.extension_update_paths($1) where path is not null;",
    )
    .bind(extension_name)
    .fetch(conn);

    let mut paths = HashSet::new();
    while let Some(update_path) = rows.try_next().await? {
        paths.insert(update_path);
    }

    Ok(paths)
}
