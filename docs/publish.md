Before you can publish your TLE, you need to authenticate with [database.dev](https://database.dev/).

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

Your TLE is now published to `database.dev` and visible at `https://database.dev/<handle>/<package_name>`. Users can install it using the [dbdev in-database client](https://database.dev/installer).
