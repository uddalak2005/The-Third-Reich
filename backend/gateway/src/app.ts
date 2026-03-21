import express from 'express';
import { Request, Response } from 'express';
import keyVaultProxy from './proxy/keyVault.proxy';
import userProxyMiddleware from './proxy/user.proxy';
import sandboxProxyMiddleware from './proxy/sandbox.proxy';
import cors from 'cors';
import {websocketProxy} from "./proxy/socket.controlPlane.proxy";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

app.get('/health-check', (req: Request, res: Response) => {
    res.send('The Third Reich is on Duty');
});

app.use('/keys', keyVaultProxy);
app.use('/user', userProxyMiddleware);
app.use('/socket', websocketProxy);
app.use('/sandbox', sandboxProxyMiddleware);

export default app;
