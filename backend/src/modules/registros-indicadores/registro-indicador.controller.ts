import type { RequestHandler } from 'express';

import {
  cadastroRegistroIndicadorSchema,
  edicaoRegistroIndicadorSchema,
  listarRegistrosIndicadoresSchema,
  publicacaoRegistroIndicadorSchema,
  registroIndicadorIdSchema,
} from './registro-indicador.schemas.js';
import {
  alterarPublicacaoRegistroIndicador,
  buscarRegistroIndicador,
  cadastrarRegistroIndicador,
  editarRegistroIndicador,
  listarRegistrosIndicadores,
} from './registro-indicador.service.js';

function apresentarRegistro(registro: Awaited<ReturnType<typeof buscarRegistroIndicador>>) {
  return {
    ...registro,
    periodo: registro.periodo.toISOString().slice(0, 10),
    valor: registro.valor.toFixed(2),
  };
}

export const cadastrar: RequestHandler = async (request, response) => {
  const dados = cadastroRegistroIndicadorSchema.parse(request.body);
  const registro = await cadastrarRegistroIndicador(dados);

  response.status(201).json({
    message: 'Registro de indicador cadastrado com sucesso.',
    registro: apresentarRegistro(registro),
  });
};

export const editar: RequestHandler = async (request, response) => {
  const { id } = registroIndicadorIdSchema.parse(request.params);
  const dados = edicaoRegistroIndicadorSchema.parse(request.body);
  const registro = await editarRegistroIndicador(id, dados);

  response.status(200).json({
    message: 'Registro de indicador atualizado com sucesso.',
    registro: apresentarRegistro(registro),
  });
};

export const alterarPublicacao: RequestHandler = async (request, response) => {
  const { id } = registroIndicadorIdSchema.parse(request.params);
  const dados = publicacaoRegistroIndicadorSchema.parse(request.body);
  const registro = await alterarPublicacaoRegistroIndicador(id, dados);

  response.status(200).json({
    message: dados.publicado
      ? 'Registro publicado com sucesso.'
      : 'Registro despublicado com sucesso.',
    registro: apresentarRegistro(registro),
  });
};

export const listar: RequestHandler = async (request, response) => {
  const filtros = listarRegistrosIndicadoresSchema.parse(request.query);
  const registros = await listarRegistrosIndicadores(filtros);

  response.status(200).json({ registros: registros.map(apresentarRegistro) });
};

export const consultar: RequestHandler = async (request, response) => {
  const { id } = registroIndicadorIdSchema.parse(request.params);
  const registro = await buscarRegistroIndicador(id);

  response.status(200).json({ registro: apresentarRegistro(registro) });
};
