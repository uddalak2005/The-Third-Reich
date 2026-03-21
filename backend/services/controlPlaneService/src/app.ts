import express from 'express';
import cors from 'cors';

const app: express.Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health-check', (req, res) => {
    res.status(200).send('The Control Plane of the Third Reich is on Duty');
});

export default app;
