use crate::credential_store::{get_secret_from_stdin, Credentials};

pub(crate) fn login(registry_name: &str) -> anyhow::Result<()> {
    let secret = get_secret_from_stdin()?;
    Credentials::write(registry_name, &secret)?;
    Ok(())
}
