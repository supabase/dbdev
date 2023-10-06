use crate::util;

use anyhow::Context;
use std::ffi::OsStr;
use std::fs;
use std::path::{Path, PathBuf};

pub struct ControlFileRef {
    pub filename: String,
    pub contents: String,
}

pub struct Metadata {
    pub extension_name: String,
    pub default_version: String,
    pub comment: Option<String>,
    pub requires: Option<Vec<String>>,
}

impl Metadata {
    fn from_control_file_ref(control_file_ref: &ControlFileRef) -> anyhow::Result<Self> {
        Ok(Self {
            extension_name: control_file_ref.extension_name()?.clone(),
            default_version: control_file_ref.default_version()?.clone(),
            comment: control_file_ref.comment()?.clone(),
            requires: control_file_ref.requires()?.clone(),
        })
    }
}

pub struct InstallFile {
    pub filename: String,
    pub version: String,
    pub body: String,
}

pub struct UpgradeFile {
    pub filename: String,
    pub from_version: String,
    pub to_version: String,
    pub body: String,
}

pub trait HasFilename {
    fn filename(&self) -> String;
}

impl HasFilename for InstallFile {
    fn filename(&self) -> String {
        self.filename.clone()
    }
}

impl HasFilename for UpgradeFile {
    fn filename(&self) -> String {
        self.filename.clone()
    }
}

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

pub struct Payload {
    /// Absolute path to extension directory
    pub abs_path: Option<PathBuf>,
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
                    if file_ext_name == &extension_name && util::is_valid_version(ver) {
                        let ifile = InstallFile {
                            filename: file_name.to_string(),
                            version: ver.to_string(),
                            body: fs::read_to_string(&path)
                                .context(format!("Failed to read file {}", &file_name))?,
                        };
                        install_files.push(ifile);
                    }
                }
                [file_ext_name, from_ver, to_ver] => {
                    // Make sure the file's extension name matches the control file
                    if file_ext_name == &extension_name
                        && util::is_valid_version(from_ver)
                        && util::is_valid_version(to_ver)
                    {
                        let ufile = UpgradeFile {
                            filename: file_name.to_string(),
                            from_version: from_ver.to_string(),
                            to_version: to_ver.to_string(),
                            body: fs::read_to_string(&path)
                                .context(format!("Failed to read file {}", &file_name))?,
                        };
                        upgrade_files.push(ufile);
                    }
                }
                _ => (),
            }
        }

        let payload = Payload {
            abs_path: Some(abs_path),
            metadata: Metadata::from_control_file_ref(&control_file)?,
            install_files,
            upgrade_files,
            readme_file,
        };
        Ok(payload)
    }
}

impl ControlFileRef {
    fn from_pathbuf(path: &Path) -> anyhow::Result<Self> {
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

    // Name of the extension. Used in the `create extesnion <extension_name>`
    fn extension_name(&self) -> anyhow::Result<String> {
        self.filename
            .strip_suffix(".control")
            .context("failed to read extension name from control file")
            .map(str::to_string)
    }

    // A comment (any string) about the extension. The comment is applied when initially creating
    // an extension, but not during extension updates (since that might override user-added
    // comments). Alternatively, the extension's comment can be set by writing a COMMENT command
    // in the script file.
    fn comment(&self) -> anyhow::Result<Option<String>> {
        for line in self.contents.lines() {
            if line.starts_with("comment") {
                return Ok(Some(self.read_control_line_value(line)?));
            }
        }
        Ok(None)
    }

    // A list of names of extensions that this extension depends on, for example requires = 'foo,
    // bar'. Those extensions must be installed before this one can be installed.
    fn requires(&self) -> anyhow::Result<Option<Vec<String>>> {
        for line in self.contents.lines() {
            if line.starts_with("requires") {
                let value = self.read_control_line_value(line)?;
                let required_packages: Vec<String> =
                    value.split(',').map(|x| x.trim().to_string()).collect();
                return Ok(Some(required_packages));
            }
        }
        Ok(None)
    }

    fn default_version(&self) -> anyhow::Result<String> {
        for line in self.contents.lines() {
            if line.starts_with("default_version") {
                return self.read_control_line_value(line);
            }
        }
        Err(anyhow::anyhow!(
            "`default_version` in control file is required"
        ))
    }

    fn read_control_line_value(&self, line: &str) -> anyhow::Result<String> {
        let parts: Vec<&str> = line.split('=').collect();
        match &parts[..] {
            [_, value] => {
                let mut base_value = value.trim();
                base_value = base_value.strip_prefix('\'').unwrap_or(base_value);
                base_value = base_value.strip_suffix('\'').unwrap_or(base_value);
                Ok(base_value.to_string())
            }
            _ => Err(anyhow::anyhow!("invalid line in control file")),
        }
    }
}
