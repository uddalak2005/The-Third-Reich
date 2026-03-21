import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { config } from '../config/config';

interface KeyVaultRequest extends Request {
    traceId?: string;
    user?: {
        agentId: string;
    };
}

const keyVaultProxyMiddleware = createProxyMiddleware({
    target: config.KEY_VAULT_URL as string,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/keys': '',
    },
    on: {
        proxyReq: (proxyReq, req: KeyVaultRequest) => {
            const r = req as KeyVaultRequest;
            proxyReq.removeHeader('Authorization');

            if (req.body && Object.keys(req.body).length) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader(
                    'Content-Length',
                    Buffer.byteLength(bodyData),
                );
                proxyReq.write(bodyData);
            }

            if (r.traceId) {
                proxyReq.setHeader('X-Trace-Id', r.traceId);
            }

            if (r.user) {
                proxyReq.setHeader('X-Agent-Id', r.user.agentId);
            }
        },

        error: (err, req, res) => {
            if ('status' in res) {
                (res as Response).status(502).json({
                    code: 'UPSTREAM_ERROR',
                    message: 'Key Vault service unavailable',
                });
            } else {
                res.end();
            }
        },
    },
});

export default keyVaultProxyMiddleware;
