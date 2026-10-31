import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CadastroEstabelecimentoInput,
  EdicaoEstabelecimentoInput,
  ListarEstabelecimentosInput,
} from './coleta.schemas.js';

function tratarErro(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002')
      throw new AppError(
        409,
        'establishment_already_registered',
        'Ja existe um estabelecimento com este CNPJ ou Cadastur.',
      );
    if (error.code === 'P2025')
      throw new AppError(404, 'establishment_not_found', 'Estabelecimento nao encontrado.');
  }
  throw error;
}

export async function cadastrarEstabelecimento(dados: CadastroEstabelecimentoInput) {
  try {
    return await prisma.estabelecimento.create({ data: dados });
  } catch (error) {
    return tratarErro(error);
  }
}

export async function editarEstabelecimento(id: string, dados: EdicaoEstabelecimentoInput) {
  try {
    return await prisma.estabelecimento.update({ where: { id }, data: dados });
  } catch (error) {
    return tratarErro(error);
  }
}

export async function buscarEstabelecimento(id: string) {
  const estabelecimento = await prisma.estabelecimento.findUnique({ where: { id } });
  if (!estabelecimento)
    throw new AppError(404, 'establishment_not_found', 'Estabelecimento nao encontrado.');
  return estabelecimento;
}

export async function listarEstabelecimentos({
  pagina,
  limite,
  ativo,
  tipo,
  busca,
}: ListarEstabelecimentosInput) {
  const where: Prisma.EstabelecimentoWhereInput = {
    ativo,
    tipo,
    OR: busca
      ? [
          { nome: { contains: busca, mode: 'insensitive' } },
          { cnpjCadastur: { contains: busca, mode: 'insensitive' } },
        ]
      : undefined,
  };
  const [estabelecimentos, total] = await prisma.$transaction(
    [
      prisma.estabelecimento.findMany({
        where,
        orderBy: [{ nome: 'asc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.estabelecimento.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  return { estabelecimentos, total };
}
