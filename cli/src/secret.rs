use core::fmt;

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

impl<T> Secret<T> {
    pub fn expose(&self) -> &T {
        &self.inner
    }
}

impl<T> fmt::Debug for Secret<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Secret")
            .field("inner", &"REDACTED")
            .finish()
    }
}
