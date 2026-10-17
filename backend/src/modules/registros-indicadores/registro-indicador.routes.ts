import { Router } from 'express';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import { cadastrar, consultar, listar } from './registro-indicador.controller.js';

export const registroIndicadorRoutes = Router();

registroIndicadorRoutes.use(
  '/admin/registros-indicadores',
  exigirAutenticacao,
  exigirAdministrador,
);
registroIndicadorRoutes.post('/admin/registros-indicadores', cadastrar);
registroIndicadorRoutes.get('/admin/registros-indicadores', listar);
registroIndicadorRoutes.get('/admin/registros-indicadores/:id', consultar);
