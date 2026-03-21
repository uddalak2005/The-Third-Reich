import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
    SentinelConfig,
    SentinelCallOptions,
    RegisterKeyOptions,
} from './types.ts';

import {
    SentinelError,
    GatewayTimeoutError,
    IntentViolationError,
    KeyRevokedError,
    KeyExpiredError,
    AgentNotAuthorisedError,
    ThresholdNotMetError,
    ShardIntegrityError,
    ValidationError,
} from './errors.ts';

/** Extract an error message from whatever shape the server sends. */
function extractMessage(data: any): string {
    if (!data) return 'No response body'
    if (typeof data === 'string') {
        // Express dev-mode sends an HTML stack trace — strip tags and collapse whitespace
        if (data.trimStart().startsWith('<')) {
            return data
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\n{3,}/g, '\n\n')
                .trim()
        }
        return data
    }
    // Common error body shapes: { message }, { error }, { err }, { msg }
    return data.message ?? data.error ?? data.err ?? data.msg ?? JSON.stringify(data)
}

/** Map a raw gateway error response to the most specific custom error class. */
function buildError(data: any, status: number): SentinelError {
    const code: string = data?.code ?? 'UNKNOWN'
    const traceId: string | undefined = data?.traceId
    const message = extractMessage(data)

    switch (code) {
        case 'INTENT_VIOLATION':
            return new IntentViolationError(
                data?.authorized ?? '(unknown)',
                data?.detected  ?? '(unknown)',
                traceId
            )
        case 'KEY_REVOKED':
            return new KeyRevokedError(data?.hollowKeyId ?? '(unknown)', traceId)
        case 'KEY_EXPIRED':
            return new KeyExpiredError(data?.hollowKeyId ?? '(unknown)', traceId)
        case 'AGENT_NOT_AUTHORISED':
            return new AgentNotAuthorisedError(data?.agentId ?? '(unknown)', traceId)
        case 'THRESHOLD_NOT_MET':
            return new ThresholdNotMetError(
                data?.available ?? 0,
                data?.required  ?? 0,
                traceId
            )
        case 'SHARD_INTEGRITY_FAILED':
            return new ShardIntegrityError(data?.shardIndex ?? -1, traceId)
        case 'VALIDATION_ERROR':
            return new ValidationError(data?.errors ?? [], traceId)
        default:
            return new SentinelError(message, code, status, traceId)
    }
}


export class SentinelClient {
    private client: AxiosInstance;
    private hollowKey: string;
    private userId: string;
    private retries: number;

    constructor(config: SentinelConfig) {
        if (!config.gatewayUrl) throw new Error('gatewayUrl required');
        if (!config.hollowKey) throw new Error('hollowKey required');
        if (!config.userId) throw new Error('userId required');

        this.hollowKey = config.hollowKey;
        this.userId = config.userId;
        this.retries = config.retries ?? 3;

        this.client = axios.create({
            baseURL: config.gatewayUrl.replace(/\/$/, ''),
            timeout: config.timeout ?? 30000,
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': this.userId,
            },
        });
    }

    /*
     * Call API
     * The main method — use this instead of calling any API directly
     *
     * Example:
     *   const result = await sentinel.call({
     *     intent:    'text-generation',
     *     url:       'https://api.openai.com/v1/chat/completions',
     *     method:    'POST',
     *     headers:   { 'Content-Type': 'application/json',
     *                 'Authorization': `Bearer ${process.env.OPENAI_HOLLOW_KEY}` },
     *     body:      { model: 'gpt-4o', messages: [...] },
     *     keyHeader: 'Authorization'
     *   })
    */

    async call(options: SentinelCallOptions) {
        return this.request('/keys/vault/callApi', {
            hollowKeyId: this.hollowKey,
            intent: options.intent,
            keyHeader: options.keyHeader,
            url: options.url,
            method: options.method ?? 'POST',
            headers: options.headers ?? {},
            body: options.body,
        });
    }

    /*
     * Register Keys
    */
    async registerKey(options: RegisterKeyOptions) {
        return this.request('/keys/register', options);
    }

    /*
     * Core Request Functionality
    */
    private async request(path: string, data: any, method: 'GET' | 'POST' | 'DELETE' = 'POST') {
        let lastError: any;

        for (let i = 0; i < this.retries; i++) {
            try {
                const res = await this.client.request({
                    url: path,
                    method,
                    data: method !== 'GET' ? data : undefined,
                });

                return res.data;

            } catch (err: any) {
                if (err.code === 'ECONNABORTED') {
                    lastError = new GatewayTimeoutError();
                } else if (err.response) {
                    const { data, status } = err.response;
                    lastError = buildError(data, status);
                } else {
                    lastError = err;
                }

                if (i < this.retries - 1) {
                    await new Promise(r => setTimeout(r, 500 * (i + 1)));
                }
            }
        }

        throw lastError;
    }
}