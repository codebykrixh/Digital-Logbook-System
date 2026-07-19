import path from 'node:path';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env, isProd } from './config/env';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import { globalLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/error';
import { notFound } from './middleware/notFound';
import apiRoutes from './routes';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  // Security & hardening
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(hpp());

  // Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());

  // Logging
  app.use(
    morgan(isProd ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    })
  );

  // Locally-stored uploads (only used when Cloudinary isn't configured)
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // Rate limiting (global)
  app.use('/api', globalLimiter);

  // API documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'DigiLog API Docs',
  }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

  // Routes
  app.use('/api', apiRoutes);

  // 404 + error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
