import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import {
  alterarPublicacao,
  aprovar,
  cadastrarLocal,
  consultar,
  consultarLocal,
  editar,
  editarLocal,
  enviar,
  listar,
  listarLocais,
  rejeitar,
  resumo,
} from './coleta.controller.js';

const envioLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'too_many_collection_attempts',
    message: 'Muitos envios de coleta. Tente novamente mais tarde.',
  },
});

export const coletaRoutes = Router();
coletaRoutes.use(
  ['/admin/estabelecimentos', '/admin/coletas', '/api/coletas', '/coletas'],
  (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  },
);
coletaRoutes.use(
  ['/admin/estabelecimentos', '/admin/coletas'],
  exigirAutenticacao,
  exigirAdministrador,
);
coletaRoutes.post('/api/coletas', envioLimiter, enviar);
coletaRoutes.get('/coletas/resumo', resumo);
coletaRoutes.post('/admin/estabelecimentos', cadastrarLocal);
coletaRoutes.get('/admin/estabelecimentos', listarLocais);
coletaRoutes.get('/admin/estabelecimentos/:id', consultarLocal);
coletaRoutes.patch('/admin/estabelecimentos/:id', editarLocal);
coletaRoutes.get('/admin/coletas', listar);
coletaRoutes.get('/admin/coletas/:id', consultar);
coletaRoutes.patch('/admin/coletas/:id', editar);
coletaRoutes.patch('/admin/coletas/:id/aprovar', aprovar);
coletaRoutes.patch('/admin/coletas/:id/rejeitar', rejeitar);
coletaRoutes.patch('/admin/coletas/:id/publicacao', alterarPublicacao);
