import app from './app';
import { config } from './config';
import { createTopics } from './kafka/topics';
import { createServer } from 'node:http';
import { initSocket } from './websockets';
import { startConsumer } from './kafka/consumer';

// Handler
import { keyHandler } from './kafka/handlers/key.handler';
import {sandboxHandler} from "./kafka/handlers/sandbox.handler";
import {attackHandler} from "./kafka/handlers/attack.handler";

const handlers = {
    'hollow.key.event': keyHandler,
    'sandbox.lifecycle': sandboxHandler,
    'attack.detected': attackHandler
};

const PORT = config.PORT || 3002;

createTopics()
    .then(() => console.log('Topics created'))
    .catch(() => console.error('Error creating KafkaTopics'));

const server = createServer(app);

initSocket(server);

startConsumer('control-plane-group', Object.keys(handlers), handlers)
    .then(() => console.log('Connected to KafkaTopics'))
    .catch(() => console.error('Error connecting to Kafka Topics'));

server.listen(PORT, () => {
    console.log(`Control Plane is listening on ${PORT}`);
});
