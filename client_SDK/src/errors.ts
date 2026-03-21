export class SentinelError extends Error {
    code: string
    status: number
    traceId?: string

    constructor(
        message: string,
        code: string,
        status: number,
        traceId?: string
    ) {
        super(message)
        this.code = code
        this.status = status
        this.traceId = traceId
        this.name = 'SentinelError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}


export class IntentViolationError extends SentinelError {
    authorized: string
    detected: string

    constructor(
        authorized: string,
        detected: string,
        traceId?: string
    ) {
        super(
            `Intent violation — authorized: "${authorized}", detected: "${detected}"`,
            'INTENT_VIOLATION',
            403,
            traceId
        )
        this.authorized = authorized
        this.detected = detected
        this.name = 'IntentViolationError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class KeyRevokedError extends SentinelError {
    constructor(hollowKeyId: string, traceId?: string) {
        super(
            `Hollow key ${hollowKeyId} has been revoked`,
            'KEY_REVOKED',
            403,
            traceId
        )
        this.name = 'KeyRevokedError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class KeyExpiredError extends SentinelError {
    constructor(hollowKeyId: string, traceId?: string) {
        super(
            `Hollow key ${hollowKeyId} has expired`,
            'KEY_EXPIRED',
            403,
            traceId
        )
        this.name = 'KeyExpiredError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class AgentNotAuthorisedError extends SentinelError {
    constructor(agentId: string, traceId?: string) {
        super(
            `Agent ${agentId} is not authorised to use this hollow key`,
            'AGENT_NOT_AUTHORISED',
            403,
            traceId
        )
        this.name = 'AgentNotAuthorisedError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class ThresholdNotMetError extends SentinelError {
    available: number
    required: number

    constructor(
        available: number,
        required: number,
        traceId?: string
    ) {
        super(
            `Guardian threshold not met — ${available}/${required} guardians reachable`,
            'THRESHOLD_NOT_MET',
            503,
            traceId
        )
        this.available = available
        this.required = required
        this.name = 'ThresholdNotMetError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class ShardIntegrityError extends SentinelError {
    constructor(shardIndex: number, traceId?: string) {
        super(
            `Shard ${shardIndex} failed integrity check — vault may be compromised`,
            'SHARD_INTEGRITY_FAILED',
            500,
            traceId
        )
        this.name = 'ShardIntegrityError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class GatewayTimeoutError extends SentinelError {
    constructor(traceId?: string) {
        super(
            'Sentinel gateway did not respond in time',
            'GATEWAY_TIMEOUT',
            504,
            traceId
        )
        this.name = 'GatewayTimeoutError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class ValidationError extends SentinelError {
    errors: Array<{ field: string; message: string }>

    constructor(
        errors: Array<{ field: string; message: string }>,
        traceId?: string
    ) {
        super(
            `Validation failed: ${errors.map(e => `${e.field} — ${e.message}`).join(', ')}`,
            'VALIDATION_ERROR',
            400,
            traceId
        )
        this.errors = errors
        this.name = 'ValidationError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}