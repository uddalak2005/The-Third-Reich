import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, './message.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const messaging = grpcObj.messaging;

interface PromptRequest {
    prompt: string;
    intent: string;
}

interface PromptResponse {
    approved: boolean;
    authorized: string;
    detected: string;
}

// TLS — trust the Python server's self-signed cert
const creds = grpc.credentials.createSsl(
    fs.readFileSync(path.resolve(__dirname, 'server.crt')),
);

const client = new messaging.PromptService(
    process.env.INTENT_FIREWALL_GRPC_URL || 'localhost:50052',
    creds,
) as grpc.Client & {
    SendPrompt(
        request: PromptRequest,
        callback: (
            err: grpc.ServiceError | null,
            response: PromptResponse,
        ) => void,
    ): void;
};

export function checkIntent(
    prompt: string,
    intent: string,
): Promise<PromptResponse> {
    console.log('Checking intent ', intent);
    return new Promise((resolve, reject) => {
        client.SendPrompt({ prompt, intent }, (err, response) => {
            if (err) {
                console.error('gRPC Error:', err);
                reject(err);
            } else {
                console.log('gRPC Response:', response);
                resolve(response);
            }
        });
    });
}
