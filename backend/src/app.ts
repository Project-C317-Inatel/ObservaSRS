import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { registrarSwagger } from './docs/swagger.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { coletaRoutes } from './modules/coletas/coleta.routes.js';
import { consultaPublicaRoutes } from './modules/consulta-publica/consulta-publica.routes.js';
import { fonteDadoRoutes } from './modules/fontes-dados/fonte-dado.routes.js';
import { indicadorRoutes } from './modules/indicadores/indicador.routes.js';
import { itemPitRoutes } from './modules/inventario-pit/item-pit.routes.js';
import { registroIndicadorRoutes } from './modules/registros-indicadores/registro-indicador.routes.js';
import { relatorioRoutes } from './modules/relatorios/relatorio.routes.js';
import { setorRoutes } from './modules/setores/setor.routes.js';
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
app.use(consultaPublicaRoutes);
app.use(adminRoutes);
app.use(setorRoutes);
app.use(indicadorRoutes);
app.use(fonteDadoRoutes);
app.use(registroIndicadorRoutes);
app.use(relatorioRoutes);
app.use(itemPitRoutes);
app.use(coletaRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
