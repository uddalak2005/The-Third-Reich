import { Router } from 'express';
import { SandboxController } from '../controllers/sandbox.controller';
import { validate } from '../middleware/validate.middleware';
import { ExecuteSandboxSchema } from '../types';

export const sandboxRouter = Router();

sandboxRouter.post(
    '/execute',
    validate(ExecuteSandboxSchema),
    SandboxController.execute,
);
sandboxRouter.get('/logs', SandboxController.getSandboxLogs);

