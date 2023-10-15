The dbdev CLI is required to publish your TLE to [database.dev](https://database.dev/).

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

    Not yet available as a Linux package. Read the next sections to download a binary or build from source.

=== "Windows"

    Not yet available as a [Scoop](https://scoop.sh/) package. Read the next sections to download a binary or build from source.

### Binary Download

Binaries for dbdev CLI are available for Linux, Windows and macOS platforms. Visit the [dbdev releases page](https://github.com/supabase/dbdev/releases) to download a binary for your OS. The downloaded binary should be placed in a folder which is in your [PATH](<https://en.wikipedia.org/wiki/PATH_(variable)>).

### Build From Source

Alternatively, you can build the binary from source. You will need to have [Rust installed](https://www.rust-lang.org/tools/install) on your system. To build from source:

1. Clone the repo: `git clone https://github.com/supabase/dbdev.git`.
2. Change directory to `dbdev`: `cd dbdev`.
3. Build: `cargo install --release`.
4. Copy the `dbdev` binary in `target/release` to a folder in your PATH.

If you have [cargo-install](https://doc.rust-lang.org/cargo/commands/cargo-install.html), you can perform all the above steps with a single command: `cargo install --git https://github.com/supabase/dbdev.git dbdev`.

Now you're ready to [publish your first package](publish.md).
