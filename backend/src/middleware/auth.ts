import type { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase.js";

// Extend Express Request to carry userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// requireAuth: rejects request with 401 if no valid Supabase JWT
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!supabase) {
    // Supabase not configured — auth disabled, pass through with no userId
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.userId = data.user.id;
  next();
}
