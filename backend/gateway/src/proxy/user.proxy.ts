import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { config } from '../config/config';

const userProxyMiddleware = createProxyMiddleware({
    target: config.USER_SERVICE_URL as string,
    changeOrigin: true,
    pathRewrite: {
        '^/user': '',
    },
    on: {
        proxyReq: (proxyReq, req: Request) => {
            console.log('Proxying to:', proxyReq.host, proxyReq.path);

            // Re-write the consumed body back onto the proxy request
            if (req.body && Object.keys(req.body).length) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader(
                    'Content-Length',
                    Buffer.byteLength(bodyData),
                );
                proxyReq.write(bodyData);
            }
        },

        proxyRes: (proxyRes, req, res) => {
            console.log('Response from target:', proxyRes.statusCode);
        },
        error: (err, req, res) => {
            if ('status' in res) {
                (res as Response).status(502).json({
                    code: 'UPSTREAM_ERROR',
                    message: 'User Auth service unavailable',
                });
            } else {
                res.end();
            }
        },
    },
});

export default userProxyMiddleware;
