import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const hasSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY;

export const supabase = (hasSupabase &&
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY!
  )) as SupabaseClient;
