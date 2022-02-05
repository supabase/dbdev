export type ApplicationConfig = {
  SUPABASE_URL: string;
  SUPABASE_KEY_ANON: string;
};

export const config: ApplicationConfig = {
  SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  SUPABASE_KEY_ANON: process.env.NEXT_PUBLIC_SUPABASE_KEY_ANON || "",
};
