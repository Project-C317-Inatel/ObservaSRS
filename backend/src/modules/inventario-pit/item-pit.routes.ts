import { Router } from 'express';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import {
  cadastrar,
  consultar,
  consultarPublico,
  editar,
  listar,
  listarPublicos,
  revisar,
} from './item-pit.controller.js';

export const itemPitRoutes = Router();
itemPitRoutes.use(['/admin/itens-pit', '/itens-pit'], (_request, response, next) => {
  response.setHeader('Cache-Control', 'no-store');
  next();
});
itemPitRoutes.use('/admin/itens-pit', exigirAutenticacao, exigirAdministrador);
itemPitRoutes.post('/admin/itens-pit', cadastrar);
itemPitRoutes.get('/admin/itens-pit', listar);
itemPitRoutes.get('/admin/itens-pit/:id', consultar);
itemPitRoutes.patch('/admin/itens-pit/:id', editar);
itemPitRoutes.patch('/admin/itens-pit/:id/revisao', revisar);
itemPitRoutes.get('/itens-pit', listarPublicos);
itemPitRoutes.get('/itens-pit/:id', consultarPublico);
