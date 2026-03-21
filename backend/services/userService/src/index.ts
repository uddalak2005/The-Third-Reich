import app from './app';
import { config } from './config';

const PORT = config.PORT || 3003;

app.listen(PORT, () => {
    console.log(`User Service is listening on ${PORT}`);
});
