import axios, { AxiosRequestConfig } from 'axios';
import { Shard } from '../types';
import { reconstruct, verifyShard } from './shamir';
import { AppError } from '../error/AppError';

export interface EnclaveRequest {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    keyHeader: string;
    hollowKeyId: string;
}

export interface EnclaveResult {
    status: number;
    body?: unknown;
    latency: number;
}

export async function executeInEnclave(
    shards: Shard[],
    request: EnclaveRequest,
): Promise<EnclaveResult> {
    /*
     * execute the API requests in an enclave so that the API Keys does not even exist in the memory
     */
    console.log(request, shards);
    // ------- Verify Shard Integrity --------
    for (const shard of shards) {
        if (!verifyShard(shard)) {
            throw new Error(`Shard ${shard.index} invalid`);
        }
    }

    // -------- Validate URL --------
    validateUrl(request.url);

    let realKey: string | null = null;

    try {
        const start = Date.now();

        realKey = reconstruct(shards);

        console.log(realKey);

        const headers = { ...request.headers };

        if (!(request.keyHeader in headers)) {
            throw new AppError(
                `Key header "${request.keyHeader}" missing`,
                'KEY_HEADER_MISSING',
                400,
            );
        }

        headers[request.keyHeader] = headers[request.keyHeader].replace(
            request.hollowKeyId,
            realKey,
        );

        // --- Axios request ---
        const config: AxiosRequestConfig = {
            method: request.method,
            url: request.url,
            headers,
            data: request.body,
            timeout: 30_000,
            validateStatus: () => true,
        };

        console.log(config);
        const response = await axios(config);

        return {
            status: response.status,
            body: response.data,
            latency: Date.now() - start,
        };
    } finally {
        // --- Cleanup ---
        if (realKey) realKey = '\0'.repeat(realKey.length);
        for (const shard of shards) shard.value = 0n;
    }
}

function validateUrl(url: string) {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new AppError(`Invalid URL: ${url}`, 'INVALID_URL', 400);
    }

    if (parsed.protocol !== 'https:')
        throw new AppError('Only HTTPS allowed', 'INSECURE_URL', 400);

    const blocked = [/^localhost$/, /^127\./, /^192\.168\./, /^10\./];
    for (const pattern of blocked) {
        if (pattern.test(parsed.hostname))
            throw new AppError(
                `Blocked host: ${parsed.hostname}`,
                'BLOCKED_HOST',
                400,
            );
    }
}
