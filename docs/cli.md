The `dbdev` CLI can be used for:

- Installing TLEs from [database.dev] or your local machine.
- Updating TLEs from [database.dev] or your local machine.
- Publishing TLEs to [database.dev](https://database.dev/).

## Installation

Installation is available through a native package, binary download or building from source.

### Native Package

=== "macOS"

    Install the CLI with [Homebrew](https://brew.sh/):
    ```
    brew install supabase/tap/dbdev
    ```

=== "Linux"

    Install the CLI with [Homebrew](https://brew.sh/):
    ```
    brew install supabase/tap/dbdev
    ```

    #### Linux packages

    Debian Linux packages are provided in [Releases](https://github.com/supabase/dbdev/releases).
    To install, download the `.deb` file and run the following:

    ```
    sudo dpkg -i <...>.deb
    ```

=== "Windows"

    Install the CLI with [Scoop](https://scoop.sh/).
    ```
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install dbdev
    ```

## Upgrading

Use `dbdev --version` to check if you are on the latest version of the CLI.

### Native Package

=== "macOS"

    Upgrade the CLI with [Homebrew](https://brew.sh/):
    ```
    brew upgrade dbdev
    ```

=== "Linux"

    Install the CLI with [Homebrew](https://brew.sh/):
    ```
    brew upgrade dbdev
    ```

    #### Linux packages

    Debian Linux packages are provided in [Releases](https://github.com/supabase/dbdev/releases).
    To upgrade, download the `.deb` file and run the following:

    ```
    sudo dpkg -i <...>.deb
    ```

=== "Windows"

    Update the CLI with [Scoop](https://scoop.sh/).
    ```
    scoop update dbdev
    ```

### Binary Download

Binaries for dbdev CLI are available for Linux, Windows and macOS platforms. Visit the [dbdev releases page](https://github.com/supabase/dbdev/releases) to download a binary for your OS. The downloaded binary should be placed in a folder which is in your [PATH](<https://en.wikipedia.org/wiki/PATH_(variable)>).

### Build From Source

Alternatively, you can build the binary from source. You will need to have [Rust installed](https://www.rust-lang.org/tools/install) on your system. To build from source:

1. Clone the repo: `git clone https://github.com/supabase/dbdev.git`.
2. Change directory to `dbdev`: `cd dbdev`.
3. Build: `cargo install --release`.
4. Copy the `dbdev` binary in `target/release` to a folder in your PATH.

If you have [cargo-install](https://doc.rust-lang.org/cargo/commands/cargo-install.html), you can perform all the above steps with a single command: `cargo install --git https://github.com/supabase/dbdev.git dbdev`.

Now you're ready to [publish your first package](publish-extension.md).
