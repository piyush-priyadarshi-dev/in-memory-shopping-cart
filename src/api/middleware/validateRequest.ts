import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Runs a Zod schema against the body, rejecting unknown fields and forwarding parse errors.
export const validateBody =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body ?? {});
      next();
    } catch (err) {
      next(err);
    }
  };

// Runs a Zod schema against the query string to reject unexpected params.
export const validateQuery =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query ?? {});
      next();
    } catch (err) {
      next(err);
    }
  };

export { ZodError };
