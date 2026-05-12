import express from 'express';
import { config } from 'dotenv';
config();


const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

