import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { CadastroSetorInput, ListarSetoresInput } from './setor.schemas.js';

export async function cadastrarSetor(dados: CadastroSetorInput) {
  try {
    return await prisma.setor.create({ data: dados });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(
        409,
        'sector_name_already_registered',
        'Ja existe um setor com este nome.',
      );
    }

    throw error;
  }
}

export function listarSetores({ ativo }: ListarSetoresInput) {
  return prisma.setor.findMany({
    where: { ativo },
    orderBy: { nome: 'asc' },
  });
}

export async function buscarSetor(id: string) {
  const setor = await prisma.setor.findUnique({ where: { id } });

  if (!setor) {
    throw new AppError(404, 'sector_not_found', 'Setor nao encontrado.');
  }

  return setor;
}
