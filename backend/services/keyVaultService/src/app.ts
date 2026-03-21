import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import keyRoute from './routes/key.route';
import { AppError } from './error/AppError';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

app.get('/health-check', (req: Request, res: Response) => {
    res.send('The Key Vault of the Third Reich is on Duty');
});

app.use('/vault', keyRoute);

// Global error handler — must have 4 params so Express treats it as an error middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.status).json({
            code: err.code,
            message: err.message,
            status: err.status,
            ...err.metadata,
        });
        return;
    }

    // Unexpected / unhandled error — don't leak internals in production
    console.error('[keyVaultService] Unhandled error:', err);
    res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        status: 500,
    });
});

export default app;
