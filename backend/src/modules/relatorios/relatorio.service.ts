import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { localizarPdf, removerPdf, salvarPdf, validarPdf } from './relatorio.arquivo.js';
import type {
  CadastroRelatorioInput,
  EdicaoRelatorioInput,
  ListarRelatoriosInput,
  ListarRelatoriosPublicosInput,
} from './relatorio.schemas.js';

const dadosAdministrativos = {
  id: true,
  titulo: true,
  descricao: true,
  tipo: true,
  periodoReferencia: true,
  arquivoChave: true,
  arquivoNome: true,
  arquivoTamanho: true,
  criadoPorId: true,
  publicado: true,
  criadoEm: true,
  atualizadoEm: true,
  publicadoEm: true,
  criadoPor: { select: { id: true, nome: true } },
} satisfies Prisma.RelatorioSelect;

const dadosPublicos = {
  id: true,
  titulo: true,
  descricao: true,
  tipo: true,
  periodoReferencia: true,
  publicadoEm: true,
} satisfies Prisma.RelatorioSelect;

const relatorioVisivel = {
  publicado: true,
  arquivoChave: { not: null },
  publicadoEm: { not: null },
} satisfies Prisma.RelatorioWhereInput;

export async function cadastrarRelatorio(dados: CadastroRelatorioInput, criadoPorId: string) {
  try {
    return await prisma.relatorio.create({
      data: { ...dados, criadoPorId },
      select: dadosAdministrativos,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(
        404,
        'report_author_not_found',
        'Administrador responsavel nao encontrado.',
      );
    }

    throw error;
  }
}

export async function buscarRelatorio(id: string) {
  const relatorio = await prisma.relatorio.findUnique({
    where: { id },
    select: dadosAdministrativos,
  });

  if (!relatorio) {
    throw new AppError(404, 'report_not_found', 'Relatorio nao encontrado.');
  }

  return relatorio;
}

export async function editarRelatorio(id: string, dados: EdicaoRelatorioInput) {
  try {
    return await prisma.relatorio.update({
      where: { id },
      data: dados,
      select: dadosAdministrativos,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError(404, 'report_not_found', 'Relatorio nao encontrado.');
    }

    throw error;
  }
}

export async function listarRelatorios({
  tipo,
  periodoReferencia,
  publicado,
  pagina,
  limite,
}: ListarRelatoriosInput) {
  const where = { tipo, periodoReferencia, publicado };
  const [relatorios, total] = await prisma.$transaction(
    [
      prisma.relatorio.findMany({
        where,
        select: dadosAdministrativos,
        orderBy: [{ criadoEm: 'desc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.relatorio.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );

  return { relatorios, total };
}

async function removerPdfSemInterromper(chave: string) {
  try {
    await removerPdf(chave);
  } catch (error) {
    console.error('Nao foi possivel remover o PDF substituido ou nao associado.', error);
  }
}

export async function enviarPdfRelatorio(id: string, arquivo: Express.Multer.File | undefined) {
  const relatorio = await buscarRelatorio(id);

  if (relatorio.publicado) {
    throw new AppError(
      409,
      'report_published',
      'Despublique o relatorio antes de substituir o PDF.',
    );
  }

  const pdf = await salvarPdf(await validarPdf(arquivo));

  try {
    // A troca condicional impede que uploads concorrentes removam o arquivo vencedor.
    const atualizado = await prisma.relatorio.updateMany({
      where: { id, publicado: false, arquivoChave: relatorio.arquivoChave },
      data: { arquivoChave: pdf.chave, arquivoNome: pdf.nome, arquivoTamanho: pdf.tamanho },
    });

    if (atualizado.count === 0) {
      await buscarRelatorio(id);
      throw new AppError(
        409,
        'report_changed',
        'O relatorio foi alterado durante o envio. Consulte novamente e tente outra vez.',
      );
    }
  } catch (error) {
    // Em erro de conexao, a atualizacao pode ter sido confirmada antes da resposta falhar.
    try {
      const associado = await prisma.relatorio.findUnique({
        where: { arquivoChave: pdf.chave },
        select: { id: true },
      });
      if (!associado) {
        await removerPdfSemInterromper(pdf.chave);
      } else if (relatorio.arquivoChave) {
        await removerPdfSemInterromper(relatorio.arquivoChave);
      }
    } catch (cleanupError) {
      console.error(
        'Nao foi possivel confirmar a associacao do PDF. Arquivo preservado para verificacao.',
        cleanupError,
      );
    }
    throw error;
  }

  if (relatorio.arquivoChave) {
    await removerPdfSemInterromper(relatorio.arquivoChave);
  }

  return buscarRelatorio(id);
}

export async function alterarPublicacaoRelatorio(id: string, publicado: boolean) {
  const relatorio = await buscarRelatorio(id);

  if (publicado) {
    if (!relatorio.arquivoChave) {
      throw new AppError(409, 'report_pdf_required', 'Anexe um PDF antes de publicar o relatorio.');
    }

    try {
      await localizarPdf(relatorio.arquivoChave);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        throw new AppError(
          409,
          'report_pdf_unavailable',
          'O PDF nao esta disponivel no armazenamento. Envie o arquivo antes de publicar.',
        );
      }

      throw error;
    }
  }

  if (relatorio.publicado === publicado) {
    return relatorio;
  }

  const atualizado = await prisma.relatorio.updateMany({
    where: { id, publicado: relatorio.publicado, arquivoChave: relatorio.arquivoChave },
    data: { publicado, publicadoEm: publicado ? new Date() : null },
  });
  const resultado = await buscarRelatorio(id);

  if (
    atualizado.count === 0 &&
    (resultado.publicado !== publicado ||
      (publicado && resultado.arquivoChave !== relatorio.arquivoChave))
  ) {
    throw new AppError(
      409,
      'report_changed',
      'O relatorio foi alterado durante a publicacao. Consulte novamente e tente outra vez.',
    );
  }

  return resultado;
}

export async function baixarPdfAdministrativo(id: string) {
  const relatorio = await buscarRelatorio(id);
  return localizarPdf(relatorio.arquivoChave);
}

export async function listarRelatoriosPublicos({
  tipo,
  periodoReferencia,
  pagina,
  limite,
}: ListarRelatoriosPublicosInput) {
  const where = { ...relatorioVisivel, tipo, periodoReferencia };
  const [relatorios, total] = await prisma.$transaction(
    [
      prisma.relatorio.findMany({
        where,
        select: dadosPublicos,
        orderBy: [{ publicadoEm: 'desc' }, { id: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.relatorio.count({ where }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );

  return { relatorios, total };
}

export async function buscarRelatorioPublico(id: string) {
  const relatorio = await prisma.relatorio.findFirst({
    where: { ...relatorioVisivel, id },
    select: dadosPublicos,
  });

  if (!relatorio) {
    throw new AppError(404, 'report_not_found', 'Relatorio nao encontrado.');
  }

  return relatorio;
}

export async function baixarPdfPublico(id: string) {
  const relatorio = await prisma.relatorio.findFirst({
    where: { ...relatorioVisivel, id },
    select: { arquivoChave: true },
  });

  if (!relatorio) {
    throw new AppError(404, 'report_not_found', 'Relatorio nao encontrado.');
  }

  return localizarPdf(relatorio.arquivoChave);
}
