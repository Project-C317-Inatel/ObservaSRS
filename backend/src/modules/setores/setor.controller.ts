import type { RequestHandler } from 'express';

import { cadastroSetorSchema, listarSetoresSchema, setorIdSchema } from './setor.schemas.js';
import { buscarSetor, cadastrarSetor, listarSetores } from './setor.service.js';

export const cadastrar: RequestHandler = async (request, response) => {
  const dados = cadastroSetorSchema.parse(request.body);
  const setor = await cadastrarSetor(dados);

  response.status(201).json({ message: 'Setor cadastrado com sucesso.', setor });
};

export const listar: RequestHandler = async (request, response) => {
  const filtros = listarSetoresSchema.parse(request.query);
  const setores = await listarSetores(filtros);

  response.status(200).json({ setores });
};

export const consultar: RequestHandler = async (request, response) => {
  const { id } = setorIdSchema.parse(request.params);
  const setor = await buscarSetor(id);

  response.status(200).json({ setor });
};
