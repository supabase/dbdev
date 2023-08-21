use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(transparent)]
pub struct Secret<T> {
    inner: T,
}

impl<T> From<T> for Secret<T> {
    fn from(inner: T) -> Self {
        Secret { inner }
    }
}
