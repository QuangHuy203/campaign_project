import express from 'express';
import { authRoutes } from './routes/authRoutes';
import { campaignRoutes } from './routes/campaignRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';

export function createApp() {
  const app = express();
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    return next();
  });
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.status(200).json({ data: { ok: true } }));

  app.use('/auth', authRoutes);
  app.use('/campaigns', campaignRoutes);

  app.use(errorMiddleware);
  return app;
}

