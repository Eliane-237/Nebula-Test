import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client that reads the service-role key so it can
 * call auth.getUser() securely in Server Actions.
 * Falls back to the anon key for actions that only need the user's JWT.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
