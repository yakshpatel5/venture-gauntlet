import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn("⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — auth and persistence disabled");
}

// Service role key bypasses RLS — only used server-side, never exposed to frontend
export const supabase = url && serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null;
