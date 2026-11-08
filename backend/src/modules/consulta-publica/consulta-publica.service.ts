import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  ListarIndicadoresPublicosInput,
  ListarRegistrosPublicosInput,
  PaginacaoPublicaInput,
} from './consulta-publica.schemas.js';

const setorPublico = {
  id: true,
  nome: true,
  descricao: true,
} satisfies Prisma.SetorSelect;

const indicadorPublico = {
  id: true,
  nome: true,
  unidade: true,
  descricao: true,
  setorId: true,
  setor: { select: setorPublico },
} satisfies Prisma.IndicadorSelect;

const registroPublico = {
  id: true,
  indicadorId: true,
  fonteId: true,
  periodo: true,
  valor: true,
  indicador: { select: indicadorPublico },
  fonte: {
    select: { id: true, nome: true, descricao: true, tipo: true, referencia: true },
  },
} satisfies Prisma.RegistroIndicadorSelect;

const indicadorVisivel = {
  ativo: true,
  setor: { ativo: true },
} satisfies Prisma.IndicadorWhereInput;

const registroVisivel = {
  publicado: true,
  indicador: indicadorVisivel,
} satisfies Prisma.RegistroIndicadorWhereInput;

export async function listarSetoresPublicos({ pagina, limite }: PaginacaoPublicaInput) {
  const where = { ativo: true };
  const [setores, total] = await prisma.$transaction(
    [
      prisma.setor.findMany({
        where,
        select: setorPublico,
        orderBy: [{ nome: 'asc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.setor.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );

  return { setores, total };
}

export async function buscarSetorPublico(id: string) {
  const setor = await prisma.setor.findFirst({ where: { id, ativo: true }, select: setorPublico });

  if (!setor) {
    throw new AppError(404, 'sector_not_found', 'Setor nao encontrado.');
  }

  return setor;
}

export async function listarIndicadoresPublicos({
  setorId,
  pagina,
  limite,
}: ListarIndicadoresPublicosInput) {
  const where = { ...indicadorVisivel, setorId };
  const [indicadores, total] = await prisma.$transaction(
    [
      prisma.indicador.findMany({
        where,
        select: indicadorPublico,
        orderBy: [{ nome: 'asc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.indicador.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );

  return { indicadores, total };
}

export async function buscarIndicadorPublico(id: string) {
  const indicador = await prisma.indicador.findFirst({
    where: { ...indicadorVisivel, id },
    select: indicadorPublico,
  });

  if (!indicador) {
    throw new AppError(404, 'indicator_not_found', 'Indicador nao encontrado.');
  }

  return indicador;
}

export async function listarRegistrosPublicos({
  indicadorId,
  fonteId,
  setorId,
  periodoInicio,
  periodoFim,
  pagina,
  limite,
}: ListarRegistrosPublicosInput) {
  const where: Prisma.RegistroIndicadorWhereInput = {
    publicado: true,
    indicadorId,
    fonteId,
    indicador: { ...indicadorVisivel, setorId },
    periodo: periodoInicio || periodoFim ? { gte: periodoInicio, lte: periodoFim } : undefined,
  };
  const [registros, total] = await prisma.$transaction(
    [
      prisma.registroIndicador.findMany({
        where,
        select: registroPublico,
        orderBy: [{ periodo: 'desc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.registroIndicador.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );

  return { registros, total };
}

export async function buscarRegistroPublico(id: string) {
  const registro = await prisma.registroIndicador.findFirst({
    where: { ...registroVisivel, id },
    select: registroPublico,
  });

  if (!registro) {
    throw new AppError(404, 'indicator_record_not_found', 'Registro de indicador nao encontrado.');
  }

  return registro;
}
