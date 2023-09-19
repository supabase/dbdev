dbdev CLI is required to publish your TLE to [database.dev](https://database.dev/)

## Installation

Binaries for dbdev CLI are available for Linux, Windows and macOS platforms. Visit the [dbdev releases page](https://github.com/supabase/dbdev/releases) to download a binary for your OS. The downloaded binary should be placed in a folder which is in your [PATH](https://en.wikipedia.org/wiki/PATH_(variable))

Alternatively, you can build the binary from source. You will need to have [Rust installed](https://www.rust-lang.org/tools/install) on your system. To build from source:

1. Clone the repo: ```git clone https://github.com/supabase/dbdev.git```.
2. Change directory to `dbdev`: ```cd dbdev```.
3. Build: ```cargo install --release```.
4. Copy the `dbdev` binary in `target/release` to a folder in you PATH.

If you have [cargo-install](https://doc.rust-lang.org/cargo/commands/cargo-install.html), you can perform all the above steps with a single command: ```cargo install --git https://github.com/supabase/dbdev.git dbdev```.

## Publishing

Before you can publish your TLE, you need to login to [database.dev](https://database.dev/).

### Login to database.dev

If you don't have an account, sign-up for one on the website. Then follow the below steps:

1. Make sure you are logged into the `database.dev` website.
2. Navigate to the **Access Tokens** page from the account drop-down at top right.
3. Click **New Token**.
4. Enter a token name and click **Create Token**.
5. Copy the generated token. Note that this is the only time the token will be shown.
6. On the terminal, run the `dbdev login` command.
7. Paste the token you copied.

You are now logged into `database.dev`.

### Publish TLE

To publish a TLE, run the `dbdev publish` command. For example, to publish a TLE in the `/all_tles/my_tle` folder run the following:

```
dbdev publish --path /all_tles/my_tle
```

Your TLE should now be published to `database.dev`. Users can now [install your TLE](/dbdev/sql-client#use).
