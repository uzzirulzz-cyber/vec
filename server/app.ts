import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import aiRoutes from './routes/aiRoutes';
import modelRoutes from './routes/modelRoutes';
import conversationRoutes from './routes/conversationRoutes';
import promptRoutes from './routes/promptRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';

export const createApp = () => {
  const app = express();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite dev inner iframe compatibility
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' },
    },
  });

  app.use('/api/', limiter);

  // Body Parser
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Start time & Request ID tracking middleware
  app.use((req, res, next) => {
    (req as any).startTime = Date.now();
    (req as any).requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    next();
  });

  // Health check endpoint required by prompt
  app.get('/api/health', (req, res) => {
    return res.status(200).json({
      success: true,
      service: 'VectorEngine AI',
      status: 'online',
      timestamp: new Date().toISOString(),
      baseURL: process.env.VECTORENGINE_BASE_URL || 'https://api.vectorengine.ai/v1',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/models', modelRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/prompts', promptRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 Handler for /api/* routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `API route ${req.originalUrl} not found` },
    });
  });

  // Error handling middleware
  app.use(errorMiddleware);

  return app;
};
