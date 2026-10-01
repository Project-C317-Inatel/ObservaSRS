import { Router } from 'express';

import { exigirAutenticacao, exigirSuperAdmin } from '../auth/auth.middleware.js';
import { aprovar, listar, rejeitar } from './admin.controller.js';

export const adminRoutes = Router();

adminRoutes.use('/admin', exigirAutenticacao, exigirSuperAdmin);
adminRoutes.get('/admin/solicitacoes', listar);
adminRoutes.patch('/admin/solicitacoes/:id/aprovar', aprovar);
adminRoutes.patch('/admin/solicitacoes/:id/rejeitar', rejeitar);
