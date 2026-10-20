import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { CadastroFonteDadoInput, ListarFontesDadosInput } from './fonte-dado.schemas.js';

export function cadastrarFonteDado(dados: CadastroFonteDadoInput) {
  return prisma.fonteDado.create({ data: dados });
}

export function listarFontesDados({ tipo }: ListarFontesDadosInput) {
  return prisma.fonteDado.findMany({
    where: { tipo },
    orderBy: { nome: 'asc' },
  });
}

export async function buscarFonteDado(id: string) {
  const fonte = await prisma.fonteDado.findUnique({ where: { id } });

  if (!fonte) {
    throw new AppError(404, 'data_source_not_found', 'Fonte de dados nao encontrada.');
  }

  return fonte;
}
