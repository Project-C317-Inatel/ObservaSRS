import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CadastroItemPitInput,
  EdicaoItemPitInput,
  ListarItensPitInput,
  ListarItensPitPublicosInput,
} from './item-pit.schemas.js';

const dadosPublicos = {
  id: true,
  nome: true,
  categoria: true,
  descricao: true,
  imagemUrl: true,
  localizacao: true,
  atualizadoEm: true,
} satisfies Prisma.ItemPitSelect;

function hojeUtc() {
  return new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
}

function prazoRevisao(data?: Date) {
  const hoje = hojeUtc();
  if (data && data <= hoje) {
    throw new AppError(
      400,
      'invalid_review_date',
      'A proxima revisao deve ser posterior ao dia atual (UTC).',
    );
  }
  return data ?? new Date(hoje.getTime() + 180 * 86400000);
}

export function apresentarItemPit(item: Awaited<ReturnType<typeof buscarItemPit>>) {
  return {
    ...item,
    revisaoPrevistaEm: item.revisaoPrevistaEm.toISOString().slice(0, 10),
    revisaoPendente: item.revisaoPrevistaEm <= hojeUtc(),
  };
}

export function cadastrarItemPit(dados: CadastroItemPitInput) {
  return prisma.itemPit.create({
    data: { ...dados, revisaoPrevistaEm: prazoRevisao(dados.revisaoPrevistaEm) },
  });
}

export async function buscarItemPit(id: string) {
  const item = await prisma.itemPit.findUnique({ where: { id } });
  if (!item) throw new AppError(404, 'pit_item_not_found', 'Item do inventario nao encontrado.');
  return item;
}

async function atualizarItem(id: string, data: Prisma.ItemPitUpdateInput) {
  try {
    return await prisma.itemPit.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError(404, 'pit_item_not_found', 'Item do inventario nao encontrado.');
    }
    throw error;
  }
}

export function editarItemPit(id: string, dados: EdicaoItemPitInput) {
  return atualizarItem(id, {
    ...dados,
    revisaoPrevistaEm:
      dados.revisaoPrevistaEm === undefined ? undefined : prazoRevisao(dados.revisaoPrevistaEm),
  });
}

export function revisarItemPit(id: string, proximaData?: Date) {
  return atualizarItem(id, {
    revisadoEm: new Date(),
    revisaoPrevistaEm: prazoRevisao(proximaData),
  });
}

function filtrosBusca({ categoria, busca }: ListarItensPitPublicosInput): Prisma.ItemPitWhereInput {
  return {
    categoria,
    OR: busca
      ? ['nome', 'descricao', 'localizacao'].map((campo) => ({
          [campo]: { contains: busca, mode: 'insensitive' },
        }))
      : undefined,
  };
}

export async function listarItensPit(filtros: ListarItensPitInput) {
  const { pagina, limite, ativo, revisaoPendente } = filtros;
  const where: Prisma.ItemPitWhereInput = {
    ...filtrosBusca(filtros),
    ativo,
    revisaoPrevistaEm:
      revisaoPendente === undefined
        ? undefined
        : revisaoPendente
          ? { lte: hojeUtc() }
          : { gt: hojeUtc() },
  };
  const [itens, total] = await prisma.$transaction(
    [
      prisma.itemPit.findMany({
        where,
        orderBy: [{ nome: 'asc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.itemPit.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  return { itens, total };
}

export async function listarItensPitPublicos(filtros: ListarItensPitPublicosInput) {
  const { pagina, limite } = filtros;
  const where = { ...filtrosBusca(filtros), ativo: true };
  const [itens, total] = await prisma.$transaction(
    [
      prisma.itemPit.findMany({
        where,
        select: dadosPublicos,
        orderBy: [{ nome: 'asc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.itemPit.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  return { itens, total };
}

export async function buscarItemPitPublico(id: string) {
  const item = await prisma.itemPit.findFirst({
    where: { id, ativo: true },
    select: dadosPublicos,
  });
  if (!item) throw new AppError(404, 'pit_item_not_found', 'Item do inventario nao encontrado.');
  return item;
}
