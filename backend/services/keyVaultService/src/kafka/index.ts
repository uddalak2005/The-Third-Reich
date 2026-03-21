import { Kafka, logLevel } from 'kafkajs';
import {config} from "../config";

export function kafkaClient(serviceId: String): Kafka {
    return new Kafka({
        clientId: `the-third-reich:${serviceId}`,
        brokers: config.KAFKA_BROKERS || ['localhost:9092'],
        logLevel: logLevel.INFO,
        retry: {
            initialRetryTime: 300,
            retries: 8,
        },
    });
}

export const TOPICS = {
    ATTACK_DETECTED: 'attack.detected',
    HOLLOW_KEY_EVENTS: 'hollow.key.event',
    SANDBOX_LIFECYCLE: 'sandbox.lifecycle',
} as const;

export type TopicName = (typeof TOPICS)[keyof typeof TOPICS];
