import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { apresentarPaginacao } from '../../shared/http/paginacao.js';
import {
  acaoColetaSchema,
  cadastroEstabelecimentoSchema,
  coletaIdSchema,
  edicaoColetaSchema,
  edicaoEstabelecimentoSchema,
  envioColetaSchema,
  listarColetasSchema,
  listarEstabelecimentosSchema,
  publicacaoColetaSchema,
  resumoColetasSchema,
} from './coleta.schemas.js';
import {
  alterarPublicacaoColeta,
  apresentarColeta,
  avaliarColeta,
  buscarColeta,
  editarColeta,
  enviarColeta,
  listarColetas,
  resumirColetas,
} from './coleta.service.js';
import {
  buscarEstabelecimento,
  cadastrarEstabelecimento,
  editarEstabelecimento,
  listarEstabelecimentos,
} from './estabelecimento.service.js';

export const enviar: RequestHandler = async (request, response) => {
  const coleta = await enviarColeta(envioColetaSchema.parse(request.body));
  const { periodo, ...dados } = coleta;
  response.status(201).json({
    message: 'Coleta enviada para validacao da SMCELT.',
    coleta: { ...dados, periodoReferencia: periodo.toISOString().slice(0, 7) },
  });
};
export const cadastrarLocal: RequestHandler = async (request, response) => {
  const estabelecimento = await cadastrarEstabelecimento(
    cadastroEstabelecimentoSchema.parse(request.body),
  );
  response
    .status(201)
    .json({ message: 'Estabelecimento cadastrado com sucesso.', estabelecimento });
};
export const editarLocal: RequestHandler = async (request, response) => {
  const { id } = coletaIdSchema.parse(request.params);
  const estabelecimento = await editarEstabelecimento(
    id,
    edicaoEstabelecimentoSchema.parse(request.body),
  );
  response.json({ message: 'Estabelecimento atualizado com sucesso.', estabelecimento });
};
export const consultarLocal: RequestHandler = async (request, response) => {
  const { id } = coletaIdSchema.parse(request.params);
  response.json({ estabelecimento: await buscarEstabelecimento(id) });
};
export const listarLocais: RequestHandler = async (request, response) => {
  const filtros = listarEstabelecimentosSchema.parse(request.query);
  const { estabelecimentos, total } = await listarEstabelecimentos(filtros);
  response.json({
    estabelecimentos,
    paginacao: apresentarPaginacao(filtros.pagina, filtros.limite, total),
  });
};
export const consultar: RequestHandler = async (request, response) => {
  const { id } = coletaIdSchema.parse(request.params);
  response.json({ coleta: apresentarColeta(await buscarColeta(id)) });
};
export const listar: RequestHandler = async (request, response) => {
  const filtros = listarColetasSchema.parse(request.query);
  const { coletas, total } = await listarColetas(filtros);
  response.json({
    coletas: coletas.map(apresentarColeta),
    paginacao: apresentarPaginacao(filtros.pagina, filtros.limite, total),
  });
};
export const editar: RequestHandler = async (request, response) => {
  const { id } = coletaIdSchema.parse(request.params);
  const coleta = await editarColeta(id, edicaoColetaSchema.parse(request.body));
  response.json({ message: 'Coleta atualizada com sucesso.', coleta: apresentarColeta(coleta) });
};

function avaliacao(status: 'APROVADO' | 'REJEITADO'): RequestHandler {
  return async (request, response) => {
    const { id } = coletaIdSchema.parse(request.params);
    acaoColetaSchema.parse(request.body ?? {});
    if (!request.auth)
      throw new AppError(401, 'authentication_required', 'Autenticacao necessaria.');
    const coleta = await avaliarColeta(id, request.auth.sub, status);
    response.json({
      message:
        status === 'APROVADO' ? 'Coleta aprovada com sucesso.' : 'Coleta rejeitada com sucesso.',
      coleta: apresentarColeta(coleta),
    });
  };
}
export const aprovar = avaliacao('APROVADO');
export const rejeitar = avaliacao('REJEITADO');

export const alterarPublicacao: RequestHandler = async (request, response) => {
  const { id } = coletaIdSchema.parse(request.params);
  const { publicado } = publicacaoColetaSchema.parse(request.body);
  const coleta = await alterarPublicacaoColeta(id, publicado);
  response.json({
    message: publicado ? 'Coleta publicada com sucesso.' : 'Coleta despublicada com sucesso.',
    coleta: apresentarColeta(coleta),
  });
};
export const resumo: RequestHandler = async (request, response) => {
  const { periodoReferencia } = resumoColetasSchema.parse(request.query);
  response.json({ resumo: await resumirColetas(periodoReferencia) });
};
