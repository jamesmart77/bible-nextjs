-- Keep app-private tables inaccessible through Supabase anon/authenticated API keys.
-- The Next.js server uses SUPABASE_SERVICE_ROLE_KEY for these tables.

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public."user";
DROP POLICY IF EXISTS "Users can create own profile" ON public."user";
DROP POLICY IF EXISTS "Users can read own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can create own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can update own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can delete own search history" ON public.search_history;

REVOKE ALL ON TABLE public."user" FROM anon, authenticated;
REVOKE ALL ON TABLE public.search_history FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.user_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.search_history_id_seq FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."user" TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.search_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.user_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.search_history_id_seq TO service_role;

COMMENT ON TABLE public."user" IS
  'App-private user table. RLS enabled; accessed by the Next.js server with service_role.';
COMMENT ON TABLE public.search_history IS
  'App-private search history table. RLS enabled; accessed by the Next.js server with service_role.';
