import {kafkaClient} from "./index";

type Handler = (data :  any, topic : string) => any;

export async function startConsumer(
    groupId: string,
    topics: string[],
    handlers: Record<string, Handler>,
) {
    const kafka = kafkaClient('topic-creator');
    const consumer = kafka.consumer({groupId});

    await consumer.connect();

    await consumer.subscribe({
        topics,
        fromBeginning: false,
    });

    console.log(`Consumer started for group: ${groupId}`);
    console.log(`Topics:`, topics);

    await consumer.run({
        eachMessage: async ( {topic, message } ) => {
            if (!message.value) return;

            try{
                const data = JSON.parse(message.value.toString());

                const handler = handlers[topic];

                if (!handler) {
                    console.warn(`No handler for topic: ${topic}`);
                    return;
                }

                await handler(data, topic);
            }
            catch (err: any) {
                console.error(`Error on topic ${topic}:`, err.message);
                console.error("Raw message:", message.value.toString());
            }
        }
    })
}