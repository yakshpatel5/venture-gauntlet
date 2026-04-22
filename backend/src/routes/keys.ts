import express from "express";
import type { Request, Response } from "express";
import { createHash, randomBytes } from "crypto";
import { supabase } from "../utils/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

// POST /api/keys — create a new API key
router.post("/keys", requireAuth, async (req: Request, res: Response) => {
  if (!supabase || !req.userId) {
    res.status(503).json({ error: "Not available" });
    return;
  }

  const { label } = req.body as { label?: string };

  // Generate: "vg_live_" + 32 random hex chars
  const rawKey = "vg_live_" + randomBytes(16).toString("hex");
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 16); // "vg_live_XXXXXXXX"

  const { error } = await supabase.from("api_keys").insert({
    user_id: req.userId,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    label: label ?? "Default key",
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Return raw key ONCE — never stored, never retrievable again
  res.json({ key: rawKey, prefix: keyPrefix, label: label ?? "Default key" });
});

// GET /api/keys — list keys (prefixes only, not raw keys)
router.get("/keys", requireAuth, async (req: Request, res: Response) => {
  if (!supabase || !req.userId) {
    res.status(503).json({ error: "Not available" });
    return;
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, key_prefix, label, created_at, last_used_at, is_active")
    .eq("user_id", req.userId)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ keys: data });
});

// DELETE /api/keys/:id — revoke a key
router.delete("/keys/:id", requireAuth, async (req: Request, res: Response) => {
  if (!supabase || !req.userId) {
    res.status(503).json({ error: "Not available" });
    return;
  }

  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", req.params.id)
    .eq("user_id", req.userId); // ensures ownership

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ revoked: true });
});

// Middleware: validate API key from Authorization: Bearer vg_live_... header
export async function requireApiKey(
  req: Request,
  res: Response,
  next: () => void
): Promise<void> {
  if (!supabase) { next(); return; }

  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer vg_live_")) {
    res.status(401).json({ error: "Invalid API key format" });
    return;
  }

  const rawKey = auth.slice(7);
  const keyHash = hashKey(rawKey);

  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, is_active, id")
    .eq("key_hash", keyHash)
    .single();

  if (error || !data || !data.is_active) {
    res.status(401).json({ error: "Invalid or revoked API key" });
    return;
  }

  // Update last_used_at (fire-and-forget)
  void supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  req.userId = data.user_id as string;
  next();
}

export default router;
