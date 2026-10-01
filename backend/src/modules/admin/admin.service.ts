import { AppError } from '../../shared/errors/app-error.js';
import { prisma } from '../../shared/database/prisma.js';
import type { StatusSolicitacao } from './admin.schemas.js';

const dadosPublicosSolicitacao = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  status: true,
  ativo: true,
  avaliadoEm: true,
  avaliadoPorId: true,
  criadoEm: true,
  atualizadoEm: true,
} as const;

export function listarSolicitacoes(status: StatusSolicitacao) {
  return prisma.usuarioAdmin.findMany({
    where: {
      status,
      papel: { not: 'SUPER_ADMIN' },
    },
    select: dadosPublicosSolicitacao,
    orderBy: { criadoEm: 'asc' },
  });
}

async function buscarSolicitacaoPendente(id: string) {
  const solicitacao = await prisma.usuarioAdmin.findUnique({
    where: { id },
  });

  if (!solicitacao || solicitacao.papel === 'SUPER_ADMIN') {
    throw new AppError(404, 'account_request_not_found', 'Solicitacao nao encontrada.');
  }

  if (solicitacao.status !== 'PENDENTE') {
    throw new AppError(
      409,
      'account_request_already_reviewed',
      'Esta solicitacao ja foi avaliada.',
    );
  }

  return solicitacao;
}

export async function aprovarSolicitacao(id: string, superAdminId: string) {
  await buscarSolicitacaoPendente(id);

  return prisma.usuarioAdmin.update({
    where: { id },
    data: {
      status: 'APROVADO',
      ativo: true,
      avaliadoEm: new Date(),
      avaliadoPorId: superAdminId,
    },
    select: dadosPublicosSolicitacao,
  });
}

export async function rejeitarSolicitacao(id: string, superAdminId: string) {
  await buscarSolicitacaoPendente(id);

  return prisma.usuarioAdmin.update({
    where: { id },
    data: {
      status: 'REJEITADO',
      ativo: false,
      avaliadoEm: new Date(),
      avaliadoPorId: superAdminId,
    },
    select: dadosPublicosSolicitacao,
  });
}
