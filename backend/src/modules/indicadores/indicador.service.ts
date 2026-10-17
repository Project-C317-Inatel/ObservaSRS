import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { buscarSetor } from '../setores/setor.service.js';
import type { CadastroIndicadorInput, ListarIndicadoresInput } from './indicador.schemas.js';

export async function cadastrarIndicador(dados: CadastroIndicadorInput) {
  const setor = await buscarSetor(dados.setorId);

  if (!setor.ativo) {
    throw new AppError(
      409,
      'sector_inactive',
      'Nao e possivel cadastrar indicador em setor inativo.',
    );
  }

  try {
    return await prisma.indicador.create({ data: dados, include: { setor: true } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(404, 'sector_not_found', 'Setor nao encontrado.');
    }

    throw error;
  }
}

export function listarIndicadores({ setorId, ativo }: ListarIndicadoresInput) {
  return prisma.indicador.findMany({
    where: { setorId, ativo },
    include: { setor: true },
    orderBy: { nome: 'asc' },
  });
}

export async function buscarIndicador(id: string) {
  const indicador = await prisma.indicador.findUnique({
    where: { id },
    include: { setor: true },
  });

  if (!indicador) {
    throw new AppError(404, 'indicator_not_found', 'Indicador nao encontrado.');
  }

  return indicador;
}
