import { Request, Response, NextFunction } from 'express';
import { runSandbox, getSandboxLogs } from '../services/sandbox.service';
import { ExecuteSandboxInput } from '../types';

export class SandboxController {
    static async execute(
        req: Request<{}, {}, ExecuteSandboxInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            console.log(req.body);
            const agentId = 'agent-say';
            const userId = '5cf9d008-f387-4ecf-9fac-8f4583b2988c';

            const result = await runSandbox(req.body, agentId, userId);

            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async logs(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.headers['x-user-id'] as string) || 'unknown';
            const logs = await getSandboxLogs(userId);
            return res.status(200).json({ logs, total: logs.length });
        } catch (err) {
            next(err);
        }
    }
}
