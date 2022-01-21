import { Typography } from "@supabase/ui";

export default function Hero() {
  return (
    <div className="p-4">
      <Typography.Title level={3}>
        The Database Package Manager
      </Typography.Title>
      <p className="pt-4">
        <Typography.Text>
          database.dev is a database package manager, similar to NPM for NodeJS,
          Cargo for Rust. It's designed for SQL and NoSQL databases (including datasets).
        </Typography.Text>
      </p>
    </div>
  );
}
