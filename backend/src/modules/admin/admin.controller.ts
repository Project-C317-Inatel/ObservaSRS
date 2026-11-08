import type { Request, RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import {
  alteracaoAcessoSchema,
  contaIdSchema,
  listarSolicitacoesSchema,
  solicitacaoIdSchema,
} from './admin.schemas.js';
import {
  aprovarSolicitacao,
  desativarConta,
  listarSolicitacoes,
  reativarConta,
  rejeitarSolicitacao,
} from './admin.service.js';

function obterSuperAdminId(request: Request): string {
  if (!request.auth) {
    throw new AppError(401, 'authentication_required', 'Autenticacao necessaria.');
  }

  return request.auth.sub;
}

export const listar: RequestHandler = async (request, response) => {
  const { status, ativo } = listarSolicitacoesSchema.parse(request.query);
  const solicitacoes = await listarSolicitacoes(status, ativo);

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

export const desativar: RequestHandler = async (request, response) => {
  const { id } = contaIdSchema.parse(request.params);
  alteracaoAcessoSchema.parse(request.body ?? {});
  const conta = await desativarConta(id, obterSuperAdminId(request));

  response.status(200).json({ message: 'Conta desativada com sucesso.', conta });
};

export const reativar: RequestHandler = async (request, response) => {
  const { id } = contaIdSchema.parse(request.params);
  alteracaoAcessoSchema.parse(request.body ?? {});
  const conta = await reativarConta(id, obterSuperAdminId(request));

  response.status(200).json({ message: 'Conta reativada com sucesso.', conta });
};
