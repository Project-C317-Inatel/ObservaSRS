import type { RequestHandler } from 'express';

import {
  cadastroIndicadorSchema,
  edicaoIndicadorSchema,
  indicadorIdSchema,
  listarIndicadoresSchema,
} from './indicador.schemas.js';
import {
  buscarIndicador,
  cadastrarIndicador,
  editarIndicador,
  listarIndicadores,
} from './indicador.service.js';

export const cadastrar: RequestHandler = async (request, response) => {
  const dados = cadastroIndicadorSchema.parse(request.body);
  const indicador = await cadastrarIndicador(dados);

  response.status(201).json({ message: 'Indicador cadastrado com sucesso.', indicador });
};

export const editar: RequestHandler = async (request, response) => {
  const { id } = indicadorIdSchema.parse(request.params);
  const dados = edicaoIndicadorSchema.parse(request.body);
  const indicador = await editarIndicador(id, dados);

  response.status(200).json({ message: 'Indicador atualizado com sucesso.', indicador });
};

export const listar: RequestHandler = async (request, response) => {
  const filtros = listarIndicadoresSchema.parse(request.query);
  const indicadores = await listarIndicadores(filtros);

  response.status(200).json({ indicadores });
};

export const consultar: RequestHandler = async (request, response) => {
  const { id } = indicadorIdSchema.parse(request.params);
  const indicador = await buscarIndicador(id);

  response.status(200).json({ indicador });
};
