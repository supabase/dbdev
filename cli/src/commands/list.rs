use std::collections::HashMap;

use futures::TryStreamExt;
use sqlx::PgConnection;

use crate::commands::install::update_paths;

pub(crate) async fn list(conn: &mut PgConnection) -> anyhow::Result<()> {
    let available_extension_versions = available_extensions_versions(conn).await?;
    let available_extensions = available_extensions(conn).await?;

    for (extension_name, versions) in available_extension_versions {
        let default_version = available_extensions.get(&extension_name);

        println!("{extension_name}");
        println!("  available versions:");
        for version in &versions {
            print!("    {version}");
            if Some(version) == default_version {
                print!(" (default)");
            }
            println!();
        }

        println!("  available update paths:");
        let update_paths = update_paths(conn, &extension_name).await?;
        if update_paths.is_empty() {
            println!("    None");
        } else {
            for update_path in update_paths {
                println!("    from {} to {}", update_path.source, update_path.target);
            }
        }
        println!();
    }

    Ok(())
}

#[derive(sqlx::FromRow)]
struct AvailableExtensionVersion {
    name: String,
    version: String,
}

async fn available_extensions_versions(
    conn: &mut PgConnection,
) -> anyhow::Result<HashMap<String, Vec<String>>> {
    let mut rows = sqlx::query_as::<_, AvailableExtensionVersion>(
        "select name, version from pgtle.available_extension_versions()",
    )
    .fetch(conn);

    let mut available_extensions = HashMap::new();
    while let Some(row) = rows.try_next().await? {
        let versions: &mut Vec<String> = available_extensions.entry(row.name).or_default();
        versions.push(row.version);
    }

    Ok(available_extensions)
}

#[derive(sqlx::FromRow)]
struct AvailableExtension {
    name: String,
    default_version: String,
}

async fn available_extensions(conn: &mut PgConnection) -> anyhow::Result<HashMap<String, String>> {
    let mut rows = sqlx::query_as::<_, AvailableExtension>(
        "select name, default_version from pgtle.available_extensions()",
    )
    .fetch(conn);

    let mut extensions = HashMap::new();
    while let Some(row) = rows.try_next().await? {
        extensions.insert(row.name, row.default_version);
    }

    Ok(extensions)
}
