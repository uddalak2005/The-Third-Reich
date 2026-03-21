import { createProxyMiddleware } from 'http-proxy-middleware';

// WebSocket (Socket.IO) proxy middleware
export const websocketProxy = createProxyMiddleware({
    target: 'http://localhost:3002', // your socket server
    changeOrigin: true,
    ws: true, // ⚡ enables WebSocket proxying

    on: {
        error: (err, req, res) => {
            console.error('WebSocket proxy error:', err);
        },
    },
});