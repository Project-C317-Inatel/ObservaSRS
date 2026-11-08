import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { EdicaoColetaInput, EnvioColetaInput, ListarColetasInput } from './coleta.schemas.js';

const dadosAdministrativos = {
  id: true,
  estabelecimentoId: true,
  nomeEstabelecimento: true,
  cnpjCadastur: true,
  periodo: true,
  leitosOcupados: true,
  origemVisitantes: true,
  status: true,
  publicado: true,
  enviadoEm: true,
  atualizadoEm: true,
  validadoEm: true,
  validadoPorId: true,
  publicadoEm: true,
  estabelecimento: {
    select: { id: true, nome: true, cnpjCadastur: true, tipo: true, ativo: true },
  },
  validadoPor: { select: { id: true, nome: true } },
} satisfies Prisma.SubmissaoColetaSelect;

function dataMes(mes: string) {
  return new Date(`${mes}-01T00:00:00.000Z`);
}

export function apresentarColeta(coleta: Awaited<ReturnType<typeof buscarColeta>>) {
  const { periodo, ...dados } = coleta;
  return { ...dados, periodoReferencia: periodo.toISOString().slice(0, 7) };
}

export async function enviarColeta(dados: EnvioColetaInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const estabelecimento = await tx.estabelecimento.upsert({
        where: { cnpjCadastur: dados.cnpjCadastur },
        create: {
          nome: dados.nomeEstabelecimento,
          cnpjCadastur: dados.cnpjCadastur,
          tipo: 'Hospedagem',
        },
        update: {},
      });
      if (!estabelecimento.ativo)
        throw new AppError(
          409,
          'establishment_inactive',
          'Este estabelecimento esta desativado. Entre em contato com a SMCELT.',
        );
      return tx.submissaoColeta.create({
        data: {
          estabelecimentoId: estabelecimento.id,
          nomeEstabelecimento: dados.nomeEstabelecimento,
          cnpjCadastur: dados.cnpjCadastur,
          periodo: dataMes(dados.periodoReferencia),
          leitosOcupados: dados.leitosOcupados,
          origemVisitantes: dados.origemVisitantes,
        },
        select: {
          id: true,
          nomeEstabelecimento: true,
          cnpjCadastur: true,
          periodo: true,
          leitosOcupados: true,
          origemVisitantes: true,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(
        409,
        'collection_already_submitted',
        'Ja existe uma coleta para este estabelecimento e mes. Entre em contato com a SMCELT para corrigir os dados.',
      );
    }
    throw error;
  }
}

export async function buscarColeta(id: string) {
  const coleta = await prisma.submissaoColeta.findUnique({
    where: { id },
    select: dadosAdministrativos,
  });
  if (!coleta) throw new AppError(404, 'collection_not_found', 'Coleta nao encontrada.');
  return coleta;
}

export async function listarColetas({
  pagina,
  limite,
  estabelecimentoId,
  status,
  periodoReferencia,
  publicado,
}: ListarColetasInput) {
  const where = {
    estabelecimentoId,
    status,
    publicado,
    periodo: periodoReferencia ? dataMes(periodoReferencia) : undefined,
  };
  const [coletas, total] = await prisma.$transaction(
    [
      prisma.submissaoColeta.findMany({
        where,
        select: dadosAdministrativos,
        orderBy: [{ enviadoEm: 'desc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.submissaoColeta.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  return { coletas, total };
}

function exigirPendente(coleta: Awaited<ReturnType<typeof buscarColeta>>) {
  if (coleta.status !== 'PENDENTE')
    throw new AppError(409, 'collection_already_reviewed', 'Esta coleta ja foi avaliada.');
}

export async function editarColeta(id: string, dados: EdicaoColetaInput) {
  const coleta = await buscarColeta(id);
  exigirPendente(coleta);
  try {
    return await prisma.submissaoColeta.update({
      where: { id, status: 'PENDENTE', atualizadoEm: coleta.atualizadoEm },
      data: dados,
      select: dadosAdministrativos,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      exigirPendente(await buscarColeta(id));
      throw new AppError(
        409,
        'collection_changed',
        'A coleta mudou durante a operacao. Consulte novamente.',
      );
    }
    throw error;
  }
}

export async function avaliarColeta(
  id: string,
  validadorId: string,
  status: 'APROVADO' | 'REJEITADO',
) {
  const coleta = await buscarColeta(id);
  exigirPendente(coleta);
  if (status === 'APROVADO' && !coleta.estabelecimento.ativo)
    throw new AppError(
      409,
      'establishment_inactive',
      'Reative o estabelecimento antes de aprovar a coleta.',
    );
  try {
    return await prisma.submissaoColeta.update({
      where: {
        id,
        status: 'PENDENTE',
        atualizadoEm: coleta.atualizadoEm,
        estabelecimento: status === 'APROVADO' ? { ativo: true } : undefined,
      },
      data: {
        status,
        validadoPorId: validadorId,
        validadoEm: new Date(),
        publicado: false,
        publicadoEm: null,
      },
      select: dadosAdministrativos,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      await buscarColeta(id);
      throw new AppError(
        409,
        'collection_changed',
        'A coleta ou o estabelecimento mudou durante a avaliacao. Consulte novamente.',
      );
    }
    throw error;
  }
}

export async function alterarPublicacaoColeta(id: string, publicado: boolean) {
  const coleta = await buscarColeta(id);
  if (publicado && (coleta.status !== 'APROVADO' || !coleta.estabelecimento.ativo)) {
    throw new AppError(
      409,
      'collection_not_publishable',
      'A publicacao exige uma coleta aprovada e um estabelecimento ativo.',
    );
  }
  if (coleta.publicado === publicado) return coleta;
  try {
    return await prisma.submissaoColeta.update({
      where: {
        id,
        publicado: !publicado,
        status: publicado ? 'APROVADO' : undefined,
        estabelecimento: publicado ? { ativo: true } : undefined,
      },
      data: { publicado, publicadoEm: publicado ? new Date() : null },
      select: dadosAdministrativos,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      const atual = await buscarColeta(id);
      if (
        atual.publicado === publicado &&
        (!publicado || (atual.status === 'APROVADO' && atual.estabelecimento.ativo))
      )
        return atual;
      throw new AppError(
        409,
        'collection_changed',
        'A coleta ou o estabelecimento mudou durante a publicacao. Consulte novamente.',
      );
    }
    throw error;
  }
}

export async function resumirColetas(periodoReferencia: string) {
  const resumo = await prisma.submissaoColeta.aggregate({
    where: {
      periodo: dataMes(periodoReferencia),
      status: 'APROVADO',
      publicado: true,
      estabelecimento: { ativo: true },
    },
    _sum: { leitosOcupados: true },
    _count: { _all: true },
  });
  return {
    periodoReferencia,
    estabelecimentos: resumo._count._all,
    leitosOcupados: resumo._sum.leitosOcupados ?? 0,
  };
}
