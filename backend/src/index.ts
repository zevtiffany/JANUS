import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { env } from './config/env';
import { errorHandler } from './core/middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { financeRoutes } from './modules/finance/finance.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { projectRoutes } from './modules/projects/projects.routes';
import { pulseRoutes } from './core/pulse/pulseRoutes';
import { hrRoutes } from './modules/hr/hr.routes';
import { documentRoutes } from './modules/documents/documents.routes';
import { forumRoutes } from './modules/forum/forum.routes';
import { registerEventHandlers } from './core/events/handlers';
import { registerRules } from './core/rules/rules';
import { logger } from './core/utils/logger';

dotenv.config();

const app = express();

// ── Global Middleware ──
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/forum', forumRoutes);

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'JANUS ERP', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── Error Handler ──
app.use(errorHandler);

// ── Initialize Systems ──
registerEventHandlers();
registerRules();

// ── Start Server ──
app.listen(env.PORT, () => {
  logger.info(`🚀 JANUS Backend running on http://localhost:${env.PORT}`);
  logger.info(`📋 Environment: ${env.NODE_ENV}`);
});

export default app;
