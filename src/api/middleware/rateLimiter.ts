import { Request, Response, NextFunction } from "express";
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/errors";

const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW_MS = 60_000;

type Entry = { count: number; windowStart: number };
const requests = new Map<string, Entry>();

// Simple in-memory IP-based rate limiter with configurable window and limit.
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const limitEnv = Number(process.env.RATE_LIMIT_PER_MIN);
  const windowEnv = Number(process.env.RATE_LIMIT_WINDOW_MS);
  const limit =
    Number.isFinite(limitEnv) && limitEnv > 0 ? limitEnv : DEFAULT_LIMIT;
  const windowMs =
    Number.isFinite(windowEnv) && windowEnv > 0 ? windowEnv : DEFAULT_WINDOW_MS;

  const now = Date.now();
  const key = req.ip || req.socket?.remoteAddress || "unknown";
  const entry = requests.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    requests.set(key, { count: 1, windowStart: now });
    return next();
  }

  if (entry.count >= limit) {
    return res.status(429).json({
      error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    });
  }

  entry.count += 1;
  next();
}
