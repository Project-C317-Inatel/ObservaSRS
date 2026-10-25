import { Router } from 'express';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import { cadastrar, consultar, listar } from './fonte-dado.controller.js';

export const fonteDadoRoutes = Router();

fonteDadoRoutes.use('/admin/fontes-dados', exigirAutenticacao, exigirAdministrador);
fonteDadoRoutes.post('/admin/fontes-dados', cadastrar);
fonteDadoRoutes.get('/admin/fontes-dados', listar);
fonteDadoRoutes.get('/admin/fontes-dados/:id', consultar);
