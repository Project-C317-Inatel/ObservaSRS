import type { Request, RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { listarSolicitacoesSchema, solicitacaoIdSchema } from './admin.schemas.js';
import { aprovarSolicitacao, listarSolicitacoes, rejeitarSolicitacao } from './admin.service.js';

function obterSuperAdminId(request: Request): string {
  if (!request.auth) {
    throw new AppError(401, 'authentication_required', 'Autenticacao necessaria.');
  }

  return request.auth.sub;
}

export const listar: RequestHandler = async (request, response) => {
  const { status } = listarSolicitacoesSchema.parse(request.query);
  const solicitacoes = await listarSolicitacoes(status);

  response.status(200).json({ solicitacoes });
};

export const aprovar: RequestHandler = async (request, response) => {
  const { id } = solicitacaoIdSchema.parse(request.params);
  const solicitacao = await aprovarSolicitacao(id, obterSuperAdminId(request));

  response.status(200).json({
    message: 'Conta aprovada com sucesso.',
    solicitacao,
  });
};

export const rejeitar: RequestHandler = async (request, response) => {
  const { id } = solicitacaoIdSchema.parse(request.params);
  const solicitacao = await rejeitarSolicitacao(id, obterSuperAdminId(request));

  response.status(200).json({
    message: 'Conta rejeitada.',
    solicitacao,
  });
};
