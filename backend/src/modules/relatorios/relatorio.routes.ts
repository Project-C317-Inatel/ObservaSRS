import { Router } from 'express';

import { exigirAdministrador, exigirAutenticacao } from '../auth/auth.middleware.js';
import { receberPdf } from './relatorio.arquivo.js';
import {
  alterarPublicacao,
  baixarArquivo,
  baixarArquivoPublico,
  cadastrar,
  consultar,
  consultarPublico,
  editar,
  enviarArquivo,
  listar,
  listarPublicos,
  validarIdUpload,
} from './relatorio.controller.js';

export const relatorioRoutes = Router();

relatorioRoutes.use(['/admin/relatorios', '/relatorios'], (_request, response, next) => {
  response.setHeader('Cache-Control', 'no-store');
  next();
});
relatorioRoutes.use('/admin/relatorios', exigirAutenticacao, exigirAdministrador);

relatorioRoutes.post('/admin/relatorios', cadastrar);
relatorioRoutes.get('/admin/relatorios', listar);
relatorioRoutes.get('/admin/relatorios/:id', consultar);
relatorioRoutes.patch('/admin/relatorios/:id', editar);
relatorioRoutes.patch('/admin/relatorios/:id/publicacao', alterarPublicacao);
relatorioRoutes.post('/admin/relatorios/:id/arquivo', validarIdUpload, receberPdf, enviarArquivo);
relatorioRoutes.get('/admin/relatorios/:id/arquivo', baixarArquivo);

relatorioRoutes.get('/relatorios', listarPublicos);
relatorioRoutes.get('/relatorios/:id', consultarPublico);
relatorioRoutes.get('/relatorios/:id/arquivo', baixarArquivoPublico);
