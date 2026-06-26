import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL must be set");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set");
}

// Server-only database client. The service role key bypasses RLS, so never import
// this module from client components or browser code.
const supabaseClient = createClient<Database>(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabaseClient;
