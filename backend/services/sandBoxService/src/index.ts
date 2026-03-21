import app from './app';
import { config } from './config';
import { createTopics } from './kafka/topics';

const port = config.PORT || 3001;

createTopics()
    .then(() => console.log('Topics created'))
    .catch(() => console.error('Error creating KafkaTopics'));

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
