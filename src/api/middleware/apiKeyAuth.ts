import { Request, Response, NextFunction } from 'express';
import { ERROR_CODES, ERROR_MESSAGES } from '../../constants/errors';

const DEFAULT_API_KEY = 'dev-api-key';

// Lightweight API key check via header. Use API_KEY env var to override the default.
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.API_KEY ?? DEFAULT_API_KEY;
  const provided = req.header('x-api-key');

  if (!provided || provided !== expectedKey) {
    return res
      .status(401)
      .json({ error: ERROR_CODES.UNAUTHORIZED, message: ERROR_MESSAGES.UNAUTHORIZED });
  }

  next();
}
