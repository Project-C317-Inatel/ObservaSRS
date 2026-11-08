import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { buscarFonteDado } from '../fontes-dados/fonte-dado.service.js';
import { buscarIndicador } from '../indicadores/indicador.service.js';
import type {
  CadastroRegistroIndicadorInput,
  EdicaoRegistroIndicadorInput,
  ListarRegistrosIndicadoresInput,
  PublicacaoRegistroIndicadorInput,
} from './registro-indicador.schemas.js';

const vinculosRegistro = {
  indicador: { include: { setor: true } },
  fonte: true,
} as const;

export async function cadastrarRegistroIndicador(dados: CadastroRegistroIndicadorInput) {
  const indicador = await buscarIndicador(dados.indicadorId);

  if (!indicador.ativo) {
    throw new AppError(
      409,
      'indicator_inactive',
      'Nao e possivel registrar valor em indicador inativo.',
    );
  }

  if (!indicador.setor.ativo) {
    throw new AppError(409, 'sector_inactive', 'Nao e possivel registrar valor em setor inativo.');
  }

  await buscarFonteDado(dados.fonteId);

  try {
    return await prisma.registroIndicador.create({
      data: { ...dados, valor: new Prisma.Decimal(dados.valor) },
      include: vinculosRegistro,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new AppError(
          409,
          'indicator_record_already_registered',
          'Ja existe um registro deste indicador, fonte e periodo.',
        );
      }

      if (error.code === 'P2003') {
        throw new AppError(
          404,
          'record_reference_not_found',
          'Indicador ou fonte de dados nao encontrado.',
        );
      }
    }

    throw error;
  }
}

export async function editarRegistroIndicador(id: string, dados: EdicaoRegistroIndicadorInput) {
  const registro = await buscarRegistroIndicador(id);
  const indicador = await buscarIndicador(dados.indicadorId ?? registro.indicadorId);

  if (!indicador.ativo) {
    throw new AppError(
      409,
      'indicator_inactive',
      'Nao e possivel editar registro em indicador inativo.',
    );
  }

  if (!indicador.setor.ativo) {
    throw new AppError(409, 'sector_inactive', 'Nao e possivel editar registro em setor inativo.');
  }

  if (dados.fonteId !== undefined) {
    await buscarFonteDado(dados.fonteId);
  }

  try {
    return await prisma.registroIndicador.update({
      where: { id },
      data: {
        ...dados,
        valor: dados.valor === undefined ? undefined : new Prisma.Decimal(dados.valor),
      },
      include: vinculosRegistro,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new AppError(
          409,
          'indicator_record_already_registered',
          'Ja existe um registro deste indicador, fonte e periodo.',
        );
      }

      if (error.code === 'P2003') {
        throw new AppError(
          404,
          'record_reference_not_found',
          'Indicador ou fonte de dados nao encontrado.',
        );
      }

      if (error.code === 'P2025') {
        throw new AppError(
          404,
          'indicator_record_not_found',
          'Registro de indicador nao encontrado.',
        );
      }
    }

    throw error;
  }
}

export async function alterarPublicacaoRegistroIndicador(
  id: string,
  { publicado }: PublicacaoRegistroIndicadorInput,
) {
  const registro = await buscarRegistroIndicador(id);

  if (publicado && !registro.indicador.ativo) {
    throw new AppError(
      409,
      'indicator_inactive',
      'Nao e possivel publicar registro em indicador inativo.',
    );
  }

  if (publicado && !registro.indicador.setor.ativo) {
    throw new AppError(
      409,
      'sector_inactive',
      'Nao e possivel publicar registro em setor inativo.',
    );
  }

  try {
    return await prisma.registroIndicador.update({
      where: { id },
      data: { publicado },
      include: vinculosRegistro,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError(
        404,
        'indicator_record_not_found',
        'Registro de indicador nao encontrado.',
      );
    }

    throw error;
  }
}

export function listarRegistrosIndicadores({
  indicadorId,
  fonteId,
  setorId,
  publicado,
  periodoInicio,
  periodoFim,
}: ListarRegistrosIndicadoresInput) {
  return prisma.registroIndicador.findMany({
    where: {
      indicadorId,
      fonteId,
      publicado,
      indicador: setorId ? { setorId } : undefined,
      periodo: periodoInicio || periodoFim ? { gte: periodoInicio, lte: periodoFim } : undefined,
    },
    include: vinculosRegistro,
    orderBy: [{ periodo: 'desc' }, { criadoEm: 'desc' }],
  });
}

export async function buscarRegistroIndicador(id: string) {
  const registro = await prisma.registroIndicador.findUnique({
    where: { id },
    include: vinculosRegistro,
  });

  if (!registro) {
    throw new AppError(404, 'indicator_record_not_found', 'Registro de indicador nao encontrado.');
  }

  return registro;
}
