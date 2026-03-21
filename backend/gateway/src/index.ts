import https from 'https';
import fs from 'fs';
import path from 'path';
import app from './app';
import { config } from './config/config';

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
    const certPath = path.join(__dirname, './certs/localhost+1.pem');
    const keyPath = path.join(__dirname, './certs/localhost+1-key.pem');

    // Check certs exist — give clear error if developer forgot to generate them
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.error(
            '[API Gateway] Certs not found. Run this inside services/api-gateway/certs:',
        );
        console.error('  mkcert localhost 127.0.0.1');
        process.exit(1);
    }

    const httpsServer = https.createServer(
        {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        },
        app,
    );

    httpsServer.listen(config.PORT, () => {
        console.log(`[API Gateway] HTTPS running on :${config.PORT}`);
    });
} else {
    app.listen(config.PORT, () => {
        console.log(`[API Gateway] HTTP running on :${config.PORT}`);
    });
}
