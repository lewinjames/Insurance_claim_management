import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDB } from './backend/config/db.js';
import authRoutes from './backend/routes/authRoutes.js';
import userRoutes from './backend/routes/userRoutes.js';
import policyholderRoutes from './backend/routes/policyholderRoutes.js';
import policyRoutes from './backend/routes/policyRoutes.js';
import claimRoutes from './backend/routes/claimRoutes.js';
import documentRoutes from './backend/routes/documentRoutes.js';
import reviewRoutes from './backend/routes/reviewRoutes.js';
import settlementRoutes from './backend/routes/settlementRoutes.js';
import reportRoutes from './backend/routes/reportRoutes.js';
import { errorHandler } from './backend/middlewares/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Initialize DB & Seed Data
  await initDB();

  // Core Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/policyholders', policyholderRoutes);
  app.use('/api/policies', policyRoutes);
  app.use('/api/claims', claimRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/settlements', settlementRoutes);
  app.use('/api/reports', reportRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      project: 'Project 29 - Insurance Claim Management',
      environment: process.env.NODE_ENV || 'development',
      time: new Date().toISOString()
    });
  });

  // Serve static postman collection
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Central error handler
  app.use(errorHandler);

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Insurance Claim Management Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
