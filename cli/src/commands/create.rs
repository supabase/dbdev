use anyhow::Context;
use sqlx::postgres::PgConnection;

pub async fn create(
    mut conn: PgConnection,
    extension_name: &str,
    schema: Option<&str>,
    version: Option<&str>,
    cascade: bool,
) -> anyhow::Result<()> {
    let mut query = format!("create extension if not exists \"{}\"", extension_name);

    if let Some(schema_name) = schema {
        query.push_str(&format!(" schema \"{}\"", schema_name));
    }

    if let Some(ver) = version {
        query.push_str(&format!(" version '{}'", ver));
    }

    if cascade {
        query.push_str(" cascade");
    }

    query.push(';');

    sqlx::query(&query)
        .execute(&mut conn)
        .await
        .context(format!("failed to create extension {}", extension_name))?;

    println!("Extension \"{}\" created successfully", extension_name);

    Ok(())
}
