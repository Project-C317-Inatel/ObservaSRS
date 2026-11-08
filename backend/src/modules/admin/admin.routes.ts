import { Router } from 'express';

import { exigirAutenticacao, exigirSuperAdmin } from '../auth/auth.middleware.js';
import { aprovar, desativar, listar, reativar, rejeitar } from './admin.controller.js';

export const adminRoutes = Router();

adminRoutes.use(['/admin/solicitacoes', '/admin/contas'], exigirAutenticacao, exigirSuperAdmin);
adminRoutes.get('/admin/solicitacoes', listar);
adminRoutes.patch('/admin/solicitacoes/:id/aprovar', aprovar);
adminRoutes.patch('/admin/solicitacoes/:id/rejeitar', rejeitar);
adminRoutes.patch('/admin/contas/:id/desativar', desativar);
adminRoutes.patch('/admin/contas/:id/reativar', reativar);
