import express from 'express';
import { sandboxRouter } from './routes/sandbox.routes';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AppError } from './error/AppError';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

app.get('/health-check', (req: Request, res: Response) => {
    res.send('The Sandbox Service of the Third Reich is on Duty');
});

app.use('/sandbox', sandboxRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.status).json({
            code: err.code,
            message: err.message,
            status: err.status,
        });
        return;
    }

    console.error('[keyVaultService] Unhandled error:', err);
    res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        status: 500,
    });
});

export default app;
