import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { nafRouter } from './routes/naf';
import { establishmentsRouter } from './routes/establishments';
import { analysisRouter } from './routes/analysis';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/naf', nafRouter);
app.use('/api/establishments', establishmentsRouter);
app.use('/api/analysis', analysisRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
