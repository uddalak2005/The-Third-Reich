import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';

const app: express.Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log('Incoming:', req.method, req.path);
    next();
});

app.get('/health-check', (req, res) => {
    res.status(200).send('The User Service of the Third Reich is on Duty');
});

app.use('/auth', authRouter);

export default app;
