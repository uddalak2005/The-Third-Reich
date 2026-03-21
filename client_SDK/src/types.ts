export interface SentinelConfig {
    gatewayUrl: string
    hollowKey: string
    retries?: number
    timeout?: number
    userId: string

}

export interface SentinelCallOptions {
    intent: string
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    headers?: Record<string, string>
    body?: unknown
    keyHeader: string
}


export interface RegisterKeyOptions {
    realApiKey: string
    agentName: string
    provider: 'openai' | 'anthropic' | 'stripe' | 'custom'
    allowedIntent: string
    agentId?: string
    expiresAt?: string    // ISO date string
}

export interface RegisterKeyResponse {
    hollowKeyId: string
    agentName: string
    provider: string
    allowedIntent: string
    status: string
    createdAt: string
    expiresAt: string | null
}

export interface SentinelResponse {
    // The raw response from the provider (OpenAI, Stripe, etc.)
    data: unknown

    // Sentinel metadata attached to every response
    traceId: string
    latencyMs: number
    status: number
}

export interface HollowKeyInfo {
    id: string
    agentName: string
    provider: string
    allowedIntent: string
    status: 'active' | 'revoked'
    timesUsed: number
    lastUsedAt: string | null
    expiresAt: string | null
    createdAt: string
}