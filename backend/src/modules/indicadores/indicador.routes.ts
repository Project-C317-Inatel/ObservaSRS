import { Router } from 'express';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import { cadastrar, consultar, editar, listar } from './indicador.controller.js';

export const indicadorRoutes = Router();

indicadorRoutes.use('/admin/indicadores', exigirAutenticacao, exigirAdministrador);
indicadorRoutes.post('/admin/indicadores', cadastrar);
indicadorRoutes.patch('/admin/indicadores/:id', editar);
indicadorRoutes.get('/admin/indicadores', listar);
indicadorRoutes.get('/admin/indicadores/:id', consultar);
