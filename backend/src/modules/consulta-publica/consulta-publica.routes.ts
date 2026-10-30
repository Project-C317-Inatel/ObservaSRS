import { Router } from 'express';

import {
  consultarIndicador,
  consultarRegistro,
  consultarSetor,
  listarIndicadores,
  listarRegistros,
  listarSetores,
} from './consulta-publica.controller.js';

export const consultaPublicaRoutes = Router();

consultaPublicaRoutes.use(
  ['/setores', '/indicadores', '/registros-indicadores'],
  (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  },
);

consultaPublicaRoutes.get('/setores', listarSetores);
consultaPublicaRoutes.get('/setores/:id', consultarSetor);
consultaPublicaRoutes.get('/indicadores', listarIndicadores);
consultaPublicaRoutes.get('/indicadores/:id', consultarIndicador);
consultaPublicaRoutes.get('/registros-indicadores', listarRegistros);
consultaPublicaRoutes.get('/registros-indicadores/:id', consultarRegistro);
