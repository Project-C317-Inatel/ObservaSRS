import type { NextFunction, RequestHandler, Response } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import {
  cadastroRelatorioSchema,
  edicaoRelatorioSchema,
  listarRelatoriosPublicosSchema,
  listarRelatoriosSchema,
  publicacaoRelatorioSchema,
  relatorioIdSchema,
} from './relatorio.schemas.js';
import {
  alterarPublicacaoRelatorio,
  baixarPdfAdministrativo,
  baixarPdfPublico,
  buscarRelatorio,
  buscarRelatorioPublico,
  cadastrarRelatorio,
  editarRelatorio,
  enviarPdfRelatorio,
  listarRelatorios,
  listarRelatoriosPublicos,
} from './relatorio.service.js';

function apresentarAdministrativo(relatorio: Awaited<ReturnType<typeof buscarRelatorio>>) {
  const { arquivoChave, ...dados } = relatorio;
  return {
    ...dados,
    arquivoUrl: arquivoChave ? `/admin/relatorios/${relatorio.id}/arquivo` : null,
  };
}

function apresentarPublico(relatorio: Awaited<ReturnType<typeof buscarRelatorioPublico>>) {
  return { ...relatorio, arquivoUrl: `/relatorios/${relatorio.id}/arquivo` };
}

function apresentarPaginacao(pagina: number, limite: number, total: number) {
  return { pagina, limite, total, totalPaginas: Math.ceil(total / limite) };
}

function enviarDownload(response: Response, next: NextFunction, caminho: string, id: string) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  response.download(
    caminho,
    `relatorio-${id}.pdf`,
    { acceptRanges: false, cacheControl: false },
    (error) => {
      if (!error) return;
      if (response.headersSent) {
        next(error);
      } else if ('code' in error && error.code === 'ENOENT') {
        next(new AppError(404, 'report_file_not_found', 'Arquivo PDF nao encontrado.'));
      } else {
        next(error);
      }
    },
  );
}

export const cadastrar: RequestHandler = async (request, response) => {
  const dados = cadastroRelatorioSchema.parse(request.body);
  if (!request.auth) {
    throw new AppError(401, 'authentication_required', 'Autenticacao necessaria.');
  }
  const relatorio = await cadastrarRelatorio(dados, request.auth.sub);
  response.status(201).json({
    message: 'Relatorio cadastrado com sucesso.',
    relatorio: apresentarAdministrativo(relatorio),
  });
};

export const editar: RequestHandler = async (request, response) => {
  const { id } = relatorioIdSchema.parse(request.params);
  const dados = edicaoRelatorioSchema.parse(request.body);
  const relatorio = await editarRelatorio(id, dados);
  response.status(200).json({
    message: 'Relatorio atualizado com sucesso.',
    relatorio: apresentarAdministrativo(relatorio),
  });
};

export const consultar: RequestHandler = async (request, response) => {
  const { id } = relatorioIdSchema.parse(request.params);
  response.status(200).json({ relatorio: apresentarAdministrativo(await buscarRelatorio(id)) });
};

export const listar: RequestHandler = async (request, response) => {
  const filtros = listarRelatoriosSchema.parse(request.query);
  const { relatorios, total } = await listarRelatorios(filtros);
  response.status(200).json({
    relatorios: relatorios.map(apresentarAdministrativo),
    paginacao: apresentarPaginacao(filtros.pagina, filtros.limite, total),
  });
};

export const validarIdUpload: RequestHandler = (request, _response, next) => {
  relatorioIdSchema.parse(request.params);
  next();
};

export const enviarArquivo: RequestHandler = async (request, response) => {
  const { id } = relatorioIdSchema.parse(request.params);
  const relatorio = await enviarPdfRelatorio(id, request.file);
  response
    .status(200)
    .json({ message: 'PDF anexado com sucesso.', relatorio: apresentarAdministrativo(relatorio) });
};

export const alterarPublicacao: RequestHandler = async (request, response) => {
  const { id } = relatorioIdSchema.parse(request.params);
  const { publicado } = publicacaoRelatorioSchema.parse(request.body);
  const relatorio = await alterarPublicacaoRelatorio(id, publicado);
  response.status(200).json({
    message: publicado ? 'Relatorio publicado com sucesso.' : 'Relatorio despublicado com sucesso.',
    relatorio: apresentarAdministrativo(relatorio),
  });
};

export const baixarArquivo: RequestHandler = async (request, response, next) => {
  const { id } = relatorioIdSchema.parse(request.params);
  enviarDownload(response, next, await baixarPdfAdministrativo(id), id);
};

export const listarPublicos: RequestHandler = async (request, response) => {
  const filtros = listarRelatoriosPublicosSchema.parse(request.query);
  const { relatorios, total } = await listarRelatoriosPublicos(filtros);
  response.status(200).json({
    relatorios: relatorios.map(apresentarPublico),
    paginacao: apresentarPaginacao(filtros.pagina, filtros.limite, total),
  });
};

export const consultarPublico: RequestHandler = async (request, response) => {
  const { id } = relatorioIdSchema.parse(request.params);
  response.status(200).json({ relatorio: apresentarPublico(await buscarRelatorioPublico(id)) });
};

export const baixarArquivoPublico: RequestHandler = async (request, response, next) => {
  const { id } = relatorioIdSchema.parse(request.params);
  enviarDownload(response, next, await baixarPdfPublico(id), id);
};
