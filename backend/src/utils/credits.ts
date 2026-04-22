import { supabase } from "./supabase.js";

// Returns current credit balance. Returns 999 (unlimited) when Supabase not configured.
export async function getCredits(userId: string): Promise<number> {
  if (!supabase) return 999;

  const { data, error } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (error || !data) return 0;
  return data.credits as number;
}

// Atomically deducts 1 credit. Returns false if balance was 0.
export async function deductCredit(userId: string): Promise<boolean> {
  if (!supabase) return true;

  const { error } = await supabase.rpc("decrement_credit", { p_user_id: userId });

  if (error) return false; // 'insufficient_credits' exception → false

  await supabase.from("credits_log").insert({
    user_id: userId,
    delta: -1,
    reason: "run_consumed",
  });

  return true;
}

// Adds credits after successful Stripe payment.
export async function addCredits(
  userId: string,
  amount: number,
  stripeSessionId: string
): Promise<void> {
  if (!supabase) return;

  await supabase.rpc("add_credits", { p_user_id: userId, p_amount: amount });

  await supabase.from("credits_log").insert({
    user_id: userId,
    delta: amount,
    reason: "purchase",
    stripe_session_id: stripeSessionId,
  });
}
