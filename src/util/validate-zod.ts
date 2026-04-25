import { zValidator } from '@hono/zod-validator';
import type { ZodSchema } from 'zod';

export const validator = (
  target: 'json' | 'query' | 'param',
  schema: ZodSchema
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          errors: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        400
      );
    }
});