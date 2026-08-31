use crate::util;

use anyhow::Context;
use std::ffi::OsStr;
use std::fs;
use std::path::{Path, PathBuf};

pub struct ControlFileRef {
    pub filename: String,
    pub contents: String,
}

#[derive(Debug)]
pub struct Metadata {
    pub extension_name: String,
    pub default_version: String,
    pub comment: Option<String>,
    pub schema: Option<String>,
    pub relocatable: bool,
    pub requires: Vec<String>,
    pub repository: Option<String>,
}

impl Metadata {
    fn from_control_file_ref(control_file_ref: &ControlFileRef) -> anyhow::Result<Self> {
        Ok(Self {
            extension_name: control_file_ref.extension_name()?.clone(),
            default_version: control_file_ref.default_version()?.clone(),
            comment: control_file_ref.comment()?.clone(),
            relocatable: control_file_ref.relocatable()?,
            requires: control_file_ref.requires()?.clone(),
            schema: control_file_ref.schema()?.clone(),
            repository: control_file_ref.repository()?.clone(),
        })
    }
}

#[derive(Debug)]
pub struct InstallFile {
    pub filename: String,
    pub version: String,
    pub body: String,
}

#[derive(Debug)]
pub struct UpgradeFile {
    pub filename: String,
    pub from_version: String,
    pub to_version: String,
    pub body: String,
}

#[derive(Debug)]
pub struct ReadmeFile {
    pub body: String,
}

impl ReadmeFile {
    pub(crate) fn from_path(path: &Path) -> anyhow::Result<ReadmeFile> {
        let file_name = path
            .file_name()
            .and_then(OsStr::to_str)
            .context("Failed to read file name")?;
        let body =
            fs::read_to_string(path).context(format!("Failed to read file {}", &file_name))?;
        Ok(ReadmeFile { body })
    }

    pub(crate) fn body(&self) -> &str {
        &self.body
    }
}

#[derive(sqlx::FromRow)]
pub(crate) struct ExtensionVersion {
    pub(crate) version: String,
}

#[derive(sqlx::FromRow, PartialEq, Eq, Hash)]
pub(crate) struct UpdatePath {
    pub(crate) source: String,
    pub(crate) target: String,
}

#[derive(Debug)]
pub struct Payload {
    pub metadata: Metadata,
    pub install_files: Vec<InstallFile>,
    pub upgrade_files: Vec<UpgradeFile>,
    pub readme_file: Option<ReadmeFile>,
}

impl Payload {
    pub fn from_path(path: &Path) -> anyhow::Result<Self> {
        // Install from Path
        let abs_path = match fs::canonicalize(path) {
            Ok(abs_path) => abs_path,
            Err(e) => {
                return Err(anyhow::anyhow!("Error: {:?}", e));
            }
        };

        if !abs_path.is_dir() {
            return Err(anyhow::anyhow!("Error: *path* is not a directory"));
        }

        let mut control_files = vec![];
        let mut sql_files = vec![];
        let mut readme_file: Option<PathBuf> = None;

        for entry in fs::read_dir(&abs_path).unwrap() {
            match entry {
                Ok(dir_entry) => {
                    let entry_path = dir_entry.path();
                    if entry_path.is_dir() {
                        continue;
                    }
                    if let Some("README.md") = entry_path.file_name().and_then(OsStr::to_str) {
                        readme_file = Some(entry_path);
                        continue;
                    }
                    let extension: Option<&str> = entry_path.extension().and_then(OsStr::to_str);
                    match extension {
                        Some("control") => control_files.push(entry_path),
                        Some("sql") => sql_files.push(entry_path),
                        _ => continue,
                    }
                }
                Err(_) => continue,
            }
        }

        let readme_file = readme_file
            .map(|path| ReadmeFile::from_path(&path))
            .transpose()?;

        // /User/<abridge>/some_ext/some_ext.control
        let control_file_path = match control_files.len() {
            0 => return Err(anyhow::anyhow!("no control file detected")),
            1 => control_files
                .pop()
                .context("failed to reference control file")?,
            _ => return Err(anyhow::anyhow!("multiple control files detected")),
        };

        // some_ext
        let control_file = ControlFileRef::from_pathbuf(&control_file_path)?;

        let extension_name = control_file.extension_name()?;

        if !util::is_valid_extension_name(&extension_name) {
            return Err(anyhow::anyhow!(
                "Invalid extension name detected: {}. It must begin with an alphabet, contain only alphanumeric characters or `_` and should be between 2 and 32 characters long.",
                extension_name
            ));
        }

        // TODO: follow the some_ext.control `directory` parameter allowing sql scripts to
        // be somewhere other than the repo root
        let mut install_files = vec![];
        let mut upgrade_files = vec![];

        for path in sql_files {
            let file_name = path.file_name().and_then(OsStr::to_str).unwrap();
            let parts: Vec<&str> = file_name
                .strip_suffix(".sql")
                .unwrap()
                .split("--")
                .collect();
            match &parts[..] {
                [file_ext_name, ver] => {
                    // Make sure the file's extension name matches the control file
                    if file_ext_name != &extension_name {
                        println!("Warning: file `{file_name}` will be skipped because its extension name(`{file_ext_name}`) doesn't match `{extension_name}`");
                        continue;
                    }
                    if !util::is_valid_version(ver) {
                        println!("Warning: file `{file_name}` will be skipped because its version (`{ver}`) is invalid. It should be have the format `major.minor.patch`.");
                        continue;
                    }

                    let ifile = InstallFile {
                        filename: file_name.to_string(),
                        version: ver.to_string(),
                        body: fs::read_to_string(&path)
                            .context(format!("Failed to read file {}", &file_name))?,
                    };
                    install_files.push(ifile);
                }
                [file_ext_name, from_ver, to_ver] => {
                    // Make sure the file's extension name matches the control file
                    if file_ext_name != &extension_name {
                        println!("Warning: file `{file_name}` will be skipped because its extension name(`{file_ext_name}`) doesn't match `{extension_name}`");
                        continue;
                    }
                    if !util::is_valid_version(from_ver) {
                        println!("Warning: file `{file_name}` will be skipped because its from version(`{from_ver}`) is invalid. It should be have the format `major.minor.patch`.");
                        continue;
                    }
                    if !util::is_valid_version(to_ver) {
                        println!("Warning: file `{file_name}` will be skipped because its from version(`{to_ver}`) is invalid. It should be have the format `major.minor.patch`.");
                        continue;
                    }

                    let ufile = UpgradeFile {
                        filename: file_name.to_string(),
                        from_version: from_ver.to_string(),
                        to_version: to_ver.to_string(),
                        body: fs::read_to_string(&path)
                            .context(format!("Failed to read file {}", &file_name))?,
                    };
                    upgrade_files.push(ufile);
                }
                _ => (),
            }
        }

        let payload = Payload {
            metadata: Metadata::from_control_file_ref(&control_file)?,
            install_files,
            upgrade_files,
            readme_file,
        };
        Ok(payload)
    }
}

use std::collections::HashMap;

impl ControlFileRef {
    pub fn from_pathbuf(path: &Path) -> anyhow::Result<Self> {
        let control_file_name = path
            .file_name()
            .and_then(OsStr::to_str)
            .context("failed to read control file name")?
            .to_string();

        let control_file_body = fs::read_to_string(path).context("failed to read control file")?;

        Ok(Self {
            filename: control_file_name,
            contents: control_file_body,
        })
    }

    pub fn parse_entries(&self) -> HashMap<String, String> {
        let mut entries = HashMap::new();

        for line in self.contents.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }

            if let Some((raw_key, raw_value)) = trimmed.split_once('=') {
                let key = raw_key.trim().to_lowercase();
                let val_str = raw_value.trim();

                let parsed_val = if val_str.starts_with('\'') {
                    let mut result = String::new();
                    let mut chars = val_str[1..].chars().peekable();
                    let mut closed = false;

                    while let Some(ch) = chars.next() {
                        if ch == '\'' {
                            if chars.peek() == Some(&'\'') {
                                // Escaped single quote via ''
                                chars.next();
                                result.push('\'');
                            } else {
                                closed = true;
                                break;
                            }
                        } else if ch == '\\' {
                            if let Some(next_ch) = chars.next() {
                                match next_ch {
                                    '\'' => result.push('\''),
                                    '\\' => result.push('\\'),
                                    'n' => result.push('\n'),
                                    't' => result.push('\t'),
                                    'r' => result.push('\r'),
                                    other => {
                                        result.push('\\');
                                        result.push(other);
                                    }
                                }
                            } else {
                                result.push('\\');
                            }
                        } else {
                            result.push(ch);
                        }
                    }

                    if !closed {
                        // If quote wasn't closed properly, fallback to trimmed string
                        val_str
                            .trim_start_matches('\'')
                            .trim_end_matches('\'')
                            .to_string()
                    } else {
                        result
                    }
                } else {
                    // Unquoted value: strip trailing comment if any
                    let no_comment = if let Some((before_comment, _)) = val_str.split_once('#') {
                        before_comment.trim()
                    } else {
                        val_str
                    };
                    no_comment.to_string()
                };

                entries.insert(key, parsed_val);
            }
        }

        entries
    }

    // Name of the extension. Used in the `create extension <extension_name>`
    pub fn extension_name(&self) -> anyhow::Result<String> {
        self.filename
            .strip_suffix(".control")
            .context("failed to read extension name from control file")
            .map(str::to_string)
    }

    // A comment (any string) about the extension.
    pub fn comment(&self) -> anyhow::Result<Option<String>> {
        let entries = self.parse_entries();
        Ok(entries.get("comment").cloned())
    }

    // A list of names of extensions that this extension depends on
    pub fn requires(&self) -> anyhow::Result<Vec<String>> {
        let entries = self.parse_entries();
        if let Some(val) = entries.get("requires") {
            let required_packages: Vec<String> = val
                .split(',')
                .map(|x| x.trim().to_string())
                .filter(|x| !x.is_empty())
                .collect();
            Ok(required_packages)
        } else {
            Ok(vec![])
        }
    }

    // The schema the extension wants to be installed in, if any
    pub fn schema(&self) -> anyhow::Result<Option<String>> {
        let entries = self.parse_entries();
        Ok(entries.get("schema").cloned())
    }

    // The home repository or homepage URL for the extension
    pub fn repository(&self) -> anyhow::Result<Option<String>> {
        let entries = self.parse_entries();
        Ok(entries
            .get("repository")
            .or_else(|| entries.get("homepage"))
            .or_else(|| entries.get("repository_url"))
            .cloned())
    }

    pub fn relocatable(&self) -> anyhow::Result<bool> {
        let entries = self.parse_entries();
        if let Some(val) = entries.get("relocatable") {
            match val.to_lowercase().as_str() {
                "true" | "yes" | "on" | "1" => Ok(true),
                "false" | "no" | "off" | "0" => Ok(false),
                other => other.parse::<bool>().context("invalid boolean for relocatable"),
            }
        } else {
            Ok(false)
        }
    }

    pub fn default_version(&self) -> anyhow::Result<String> {
        let entries = self.parse_entries();
        if let Some(val) = entries.get("default_version") {
            if !val.is_empty() {
                return Ok(val.clone());
            }
        }
        Err(anyhow::anyhow!(
            "`default_version` in control file is required"
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_control_file_parsing_robust() {
        let control_content = r#"
            # PostgreSQL extension control file
            # Comment line with leading spaces
            comment = 'A great extension with \'escaped\' quotes' # inline comment
            default_version = '1.2.3'
            relocatable = true
            requires = 'pg_net,  supabase_vault , pg_graphql'
            schema = 'public'
            repository = 'https://github.com/supabase/my_ext'
        "#;

        let control_file = ControlFileRef {
            filename: "my_ext.control".to_string(),
            contents: control_content.to_string(),
        };

        assert_eq!(control_file.extension_name().unwrap(), "my_ext");
        assert_eq!(
            control_file.comment().unwrap().unwrap(),
            "A great extension with 'escaped' quotes"
        );
        assert_eq!(control_file.default_version().unwrap(), "1.2.3");
        assert_eq!(control_file.relocatable().unwrap(), true);
        assert_eq!(
            control_file.requires().unwrap(),
            vec!["pg_net", "supabase_vault", "pg_graphql"]
        );
        assert_eq!(control_file.schema().unwrap().unwrap(), "public");
        assert_eq!(
            control_file.repository().unwrap().unwrap(),
            "https://github.com/supabase/my_ext"
        );
    }

    #[test]
    fn test_control_file_boolean_variants() {
        let bool_tests = [
            ("relocatable = yes", true),
            ("relocatable = ON", true),
            ("relocatable = 1", true),
            ("relocatable = 'true'", true),
            ("relocatable = no", false),
            ("relocatable = off", false),
            ("relocatable = 0", false),
            ("relocatable = 'false'", false),
        ];

        for (line, expected) in bool_tests {
            let cf = ControlFileRef {
                filename: "ext.control".to_string(),
                contents: format!("default_version = '1.0.0'\n{}", line),
            };
            assert_eq!(cf.relocatable().unwrap(), expected, "Failed for {}", line);
        }
    }
}
