import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { registrarSwagger } from './docs/swagger.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { statusRoutes } from './modules/status/status.routes.js';
import { errorHandler } from './shared/http/error-handler.js';
import { notFoundHandler } from './shared/http/not-found-handler.js';

export const app = express();

app.disable('x-powered-by');

registrarSwagger(app);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use(statusRoutes);
app.use(authRoutes);
app.use(adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
