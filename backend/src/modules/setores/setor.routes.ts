import { Router } from 'express';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import { cadastrar, consultar, listar } from './setor.controller.js';

export const setorRoutes = Router();

setorRoutes.use('/admin/setores', exigirAutenticacao, exigirAdministrador);
setorRoutes.post('/admin/setores', cadastrar);
setorRoutes.get('/admin/setores', listar);
setorRoutes.get('/admin/setores/:id', consultar);
