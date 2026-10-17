import { Router } from 'express';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import { cadastrar, consultar, listar } from './indicador.controller.js';

export const indicadorRoutes = Router();

indicadorRoutes.use('/admin/indicadores', exigirAutenticacao, exigirAdministrador);
indicadorRoutes.post('/admin/indicadores', cadastrar);
indicadorRoutes.get('/admin/indicadores', listar);
indicadorRoutes.get('/admin/indicadores/:id', consultar);
