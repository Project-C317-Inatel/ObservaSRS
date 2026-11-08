import type { RequestHandler } from 'express';

import {
  cadastroFonteDadoSchema,
  edicaoFonteDadoSchema,
  fonteDadoIdSchema,
  listarFontesDadosSchema,
} from './fonte-dado.schemas.js';
import {
  buscarFonteDado,
  cadastrarFonteDado,
  editarFonteDado,
  listarFontesDados,
} from './fonte-dado.service.js';

export const cadastrar: RequestHandler = async (request, response) => {
  const dados = cadastroFonteDadoSchema.parse(request.body);
  const fonte = await cadastrarFonteDado(dados);

  response.status(201).json({ message: 'Fonte de dados cadastrada com sucesso.', fonte });
};

export const editar: RequestHandler = async (request, response) => {
  const { id } = fonteDadoIdSchema.parse(request.params);
  const dados = edicaoFonteDadoSchema.parse(request.body);
  const fonte = await editarFonteDado(id, dados);

  response.status(200).json({ message: 'Fonte de dados atualizada com sucesso.', fonte });
};

export const listar: RequestHandler = async (request, response) => {
  const filtros = listarFontesDadosSchema.parse(request.query);
  const fontes = await listarFontesDados(filtros);

  response.status(200).json({ fontes });
};

export const consultar: RequestHandler = async (request, response) => {
  const { id } = fonteDadoIdSchema.parse(request.params);
  const fonte = await buscarFonteDado(id);

  response.status(200).json({ fonte });
};
