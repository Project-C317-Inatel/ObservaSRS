import { Prisma } from '../../generated/prisma/client.js';
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

export function listarSolicitacoes(status: StatusSolicitacao, ativo?: boolean) {
  return prisma.usuarioAdmin.findMany({
    where: {
      status,
      ativo,
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

async function avaliarSolicitacao(
  id: string,
  superAdminId: string,
  status: 'APROVADO' | 'REJEITADO',
) {
  await buscarSolicitacaoPendente(id);

  try {
    return await prisma.usuarioAdmin.update({
      where: { id, status: 'PENDENTE', papel: { not: 'SUPER_ADMIN' } },
      data: {
        status,
        ativo: status === 'APROVADO',
        avaliadoEm: new Date(),
        avaliadoPorId: superAdminId,
      },
      select: dadosPublicosSolicitacao,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      await buscarSolicitacaoPendente(id);
      throw new AppError(
        409,
        'account_request_changed',
        'A solicitacao mudou durante a avaliacao. Consulte novamente e tente outra vez.',
      );
    }

    throw error;
  }
}

export function aprovarSolicitacao(id: string, superAdminId: string) {
  return avaliarSolicitacao(id, superAdminId, 'APROVADO');
}

export function rejeitarSolicitacao(id: string, superAdminId: string) {
  return avaliarSolicitacao(id, superAdminId, 'REJEITADO');
}

async function buscarContaAprovada(id: string, superAdminId: string) {
  if (id === superAdminId) {
    throw new AppError(
      403,
      'self_account_change_forbidden',
      'Nao e permitido alterar o proprio acesso por esta rota.',
    );
  }

  const conta = await prisma.usuarioAdmin.findUnique({
    where: { id },
    select: dadosPublicosSolicitacao,
  });

  if (!conta) {
    throw new AppError(404, 'admin_account_not_found', 'Conta administrativa nao encontrada.');
  }

  if (conta.papel === 'SUPER_ADMIN') {
    throw new AppError(
      403,
      'super_admin_account_protected',
      'Contas de super administrador nao podem ser alteradas por esta rota.',
    );
  }

  if (conta.status !== 'APROVADO') {
    throw new AppError(
      409,
      'account_not_approved',
      'Apenas contas ja aprovadas podem ser desativadas ou reativadas.',
    );
  }

  return conta;
}

async function alterarAcessoConta(id: string, superAdminId: string, ativo: boolean) {
  const conta = await buscarContaAprovada(id, superAdminId);

  if (conta.ativo === ativo) {
    return conta;
  }

  try {
    return await prisma.usuarioAdmin.update({
      where: { id, status: 'APROVADO', papel: { not: 'SUPER_ADMIN' }, ativo: !ativo },
      data: { ativo, versaoSessao: { increment: 1 } },
      select: dadosPublicosSolicitacao,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      const atual = await buscarContaAprovada(id, superAdminId);
      if (atual.ativo === ativo) {
        return atual;
      }

      throw new AppError(
        409,
        'account_state_changed',
        'O acesso da conta mudou durante a operacao. Consulte novamente e tente outra vez.',
      );
    }

    throw error;
  }
}

export function desativarConta(id: string, superAdminId: string) {
  return alterarAcessoConta(id, superAdminId, false);
}

export function reativarConta(id: string, superAdminId: string) {
  return alterarAcessoConta(id, superAdminId, true);
}
