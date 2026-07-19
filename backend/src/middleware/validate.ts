import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

/**
 * Validate and coerce `req.body`, `req.query`, and `req.params` against a Zod
 * schema shaped as `{ body?, query?, params? }`. Parsed values replace the
 * originals so downstream handlers receive typed, sanitized input.
 */
export const validate =
  (schema: Schema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      const data = parsed as {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      if (data.body !== undefined) req.body = data.body;
      if (data.query !== undefined)
        Object.assign(req.query as object, data.query);
      if (data.params !== undefined)
        Object.assign(req.params as object, data.params);
      next();
    } catch (err) {
      next(err);
    }
  };
