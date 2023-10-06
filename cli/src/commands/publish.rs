use std::path::Path;

use crate::client::{
    self, PublishPackageRequest, PublishPackageUpgradeRequest, PublishPackageVersionRequest,
};
use crate::credential_store::Credentials;
use crate::models::{self, InstallFile, Payload, ReadmeFile, UpgradeFile};

pub async fn publish(
    client: &client::APIClient<'_>,
    package_foler_path: &Path,
    registry_name: &str,
) -> anyhow::Result<()> {
    let credentials = Credentials::read()?;
    let access_token = credentials.get_token(registry_name)?.value.clone().into();

    let jwt = client.redeem_access_token(access_token).await?;

    let payload = models::Payload::from_path(package_foler_path)?;
    let Some(ref readme_file) = payload.readme_file else {
        return Err(anyhow::anyhow!("No `README.md` file found"));
    };

    let request = create_publish_package_request(&payload);
    client.publish_package(&jwt, &request).await?;

    let mut num_published = 0;

    for install_file in &payload.install_files {
        let request = create_publich_package_version_request(
            &payload.metadata.extension_name,
            install_file,
            readme_file,
        );
        if client
            .publish_package_version(&jwt, &request)
            .await?
            .is_some()
        {
            num_published += 1;
            println!(
                "Published package {} version {}",
                request.package_name, request.version
            );
        }
    }

    if num_published == 0 {
        return Err(anyhow::anyhow!("No valid script file (.sql) found."));
    }

    for upgrade_file in &payload.upgrade_files {
        let request =
            create_publich_package_upgrade_request(&payload.metadata.extension_name, upgrade_file);
        if client
            .publish_package_upgrade(&jwt, &request)
            .await?
            .is_some()
        {
            num_published += 1;
            println!(
                "Published package {} upgrade from {} to {}",
                request.package_name, request.from_version, request.to_version
            );
        }
    }

    if num_published == 0 {
        println!("Nothing to publish");
    }

    Ok(())
}

fn create_publish_package_request(payload: &Payload) -> PublishPackageRequest {
    PublishPackageRequest {
        package_name: &payload.metadata.extension_name,
        package_description: &payload.metadata.comment,
    }
}

fn create_publich_package_version_request<'a>(
    package_name: &'a str,
    install_file: &'a InstallFile,
    readme_file: &'a ReadmeFile,
) -> PublishPackageVersionRequest<'a> {
    PublishPackageVersionRequest {
        package_name,
        version: &install_file.version,
        version_source: &install_file.body,
        version_description: readme_file.body(),
    }
}

fn create_publich_package_upgrade_request<'a>(
    package_name: &'a str,
    upgrade_file: &'a UpgradeFile,
) -> PublishPackageUpgradeRequest<'a> {
    PublishPackageUpgradeRequest {
        package_name,
        from_version: &upgrade_file.from_version,
        to_version: &upgrade_file.to_version,
        upgrade_source: &upgrade_file.body,
    }
}
