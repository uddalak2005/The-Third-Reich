import { kafkaClient } from './index';

export const TOPICS = [
    {
        topic: 'attack.detected',
        numPartitions: 3,
        configEntries: [
            { name: 'retention.ms', value: '604800000' },
            { name: 'cleanup.policy', value: 'delete' },
        ],
    },
    {
        topic: 'hollow.key.event',
        numPartitions: 3,
        configEntries: [
            { name: 'retention.ms', value: '604800000' },
            { name: 'cleanup.policy', value: 'delete' },
        ],
    },
    {
        topic: 'sandbox.lifecycle',
        numPartitions: 3,
        configEntries: [
            { name: 'retention.ms', value: '604800000' },
            { name: 'cleanup.policy', value: 'delete' },
        ],
    },
];

export async function createTopics() {
    const admin = kafkaClient('topic-creator').admin();

    admin
        .connect()
        .then(() => {
            console.log('Connected to Kafka');
        })
        .catch(() => {
            console.log('Failed to connect to Kafka');
        });

    const existingTopics = await admin.listTopics();

    const topicsToCreate = TOPICS.filter(
        (t) => !existingTopics.includes(t.topic),
    );

    if (topicsToCreate.length === 0) {
        console.log('Topics already exist');
        await admin.disconnect();
        return;
    }

    try {
        await admin.createTopics({
            topics: topicsToCreate,
            waitForLeaders: true,
        });

        console.log('Topics created : ' + JSON.stringify(topicsToCreate));
    } catch (err) {
        console.error('Topic Creation Failed : ', err);
    } finally {
        await admin.disconnect();
    }
}
