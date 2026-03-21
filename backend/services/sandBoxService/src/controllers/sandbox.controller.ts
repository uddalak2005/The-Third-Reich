import { Request, Response, NextFunction } from 'express';
import { runSandbox, getSandboxLogs } from '../services/sandbox.service';
import { ExecuteSandboxInput } from '../types';
import {AppError} from "../error/AppError";
import {prisma} from "../db/prisma";

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


    static async getSandboxLogs(req: Request, res: Response) {
        const userId = '5cf9d008-f387-4ecf-9fac-8f4583b2988c';

        if (!userId) {
            throw new AppError('User ID required', 'MISSING_USER_ID', 400)
        }

        const logs = await prisma.sandboxLog.findMany({
            where:   { userId },
            orderBy: { executedAt: 'desc' },
            take:    50
        })

        res.status(200).json({
            logs,
            total: logs.length
        })
    }



}
