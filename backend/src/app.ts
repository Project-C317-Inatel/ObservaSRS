import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { statusRoutes } from './modules/status/status.routes';
import { errorHandler } from './shared/http/error-handler';
import { notFoundHandler } from './shared/http/not-found-handler';

export const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use(statusRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
