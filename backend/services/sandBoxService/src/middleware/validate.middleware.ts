import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const tree = z.treeifyError(result.error);

            return res.status(400).json({
                code: 'VALIDATION_ERROR',
                errors: JSON.stringify(tree, null, 2),
            });
        }

        // Replace raw body with validated + cleaned data
        req.body = result.data;
        next();
    };
}
