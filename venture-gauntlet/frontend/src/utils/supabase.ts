import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// supabase is null when env vars not set — auth features disabled gracefully
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
