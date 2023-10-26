Before you can publish your extension, you need to authenticate with [database.dev](https://database.dev/).

### Login to database.dev

If you don't have an account, [sign-up for one](https://database.dev/sign-up) on the website. Then follow the steps below:

1. Make sure you are logged into the `database.dev` website.
2. Navigate to the **Access Tokens** page from the account drop-down at top right.
3. Click **New Token**.
4. Enter a token name and click **Create Token**.
5. Copy the generated token. Note that this is the only time the token will be shown.
6. On the terminal, run the `dbdev login` command.
7. Paste the token you copied.

You are now logged into `database.dev`.

### Publish Your First Extension

Let's create your first extension. Create a folder which will contain the extension:

```
mkdir my_first_tle
cd my_first_tle
```

Next create a `hello_world--0.0.1.sql` file, which will contain your extension's SQL objects.  Add the following function definition to this file:

```sql
create function greet(name text default 'world')
  returns text language sql
as $$ select 'hello, ' || name; $$;
```

Let's also add some docs about this extension. Create a `README.md` file and add the following content to it:

```
The `hello_world` extension provides a `greet` function, which returns a greeting.
```

Lastly, add a `hello_world.control` file with the following key-value pairs:

```
default_version = 0.0.1
comment = 'An extension to generate greetings'
```

Your extension is ready to publish. Its name is `hello_world` and version is `0.0.1`. For details about what constitutes a valid extension, read about the [Structure of an Extension](extension_structure.md).

Now run the `dbdev publish` command to publish it.

```
dbdev publish
```

Your extension is now published to `database.dev` and visible under your account profile. You can visit your account profile from the account drop-down at the top right. Users can now install your extension using the [dbdev in-database client](https://database.dev/installer).
