import { Producer, Message } from 'kafkajs';
import { kafkaClient, TopicName } from './index';

class KafkaProducer {
    private producer: Producer;
    private connected: boolean = false;

    constructor(serviceId: string) {
        const kafka = kafkaClient(serviceId);

        this.producer = kafka.producer({
            idempotent: true,
            transactionalId: `sentinel-${serviceId}-producer`,
        });
    }

    async connect(): Promise<void> {
        await this.producer.connect();
        this.connected = true;
        console.log(`[KafkaProducer] Connected.`);
    }

    async disconnect(): Promise<void> {
        await this.producer.disconnect();
        this.connected = false;
    }

    async publish(
        topic: TopicName,
        payLoad: Record<string, unknown>,
        key?: string,
    ): Promise<void> {
        const Message = {
            key: key ?? null,
            value: JSON.stringify({
                ...payLoad,
                publishedAt: new Date().toISOString(),
            }),
        };

        await this.producer.send({
            topic,
            messages: [Message],
        });
    }

    async publishBatch(
        events: Array<{ topic: TopicName; payLoad: Record<string, unknown> }>,
    ): Promise<void> {
        const grouped = events.reduce(
            (acc, { topic, payLoad }) => {
                if (!acc[topic]) acc[topic] = [];

                acc[topic].push({
                    key: (payLoad.eventId as string) ?? null,
                    value: JSON.stringify({
                        ...payLoad,
                        publishedAt: new Date().toISOString(),
                    }),
                });

                return acc;
            },
            {} as Record<string, Message[]>,
        );

        await this.producer.sendBatch({
            topicMessages: Object.entries(grouped).map(([topic, messages]) => ({
                topic,
                messages,
            })),
        });
    }
}
