import type { RequestHandler } from 'express';

import { apresentarPaginacao } from '../../shared/http/paginacao.js';
import {
  cadastroItemPitSchema,
  edicaoItemPitSchema,
  itemPitIdSchema,
  listarItensPitPublicosSchema,
  listarItensPitSchema,
  revisaoItemPitSchema,
} from './item-pit.schemas.js';
import {
  apresentarItemPit,
  buscarItemPit,
  buscarItemPitPublico,
  cadastrarItemPit,
  editarItemPit,
  listarItensPit,
  listarItensPitPublicos,
  revisarItemPit,
} from './item-pit.service.js';

export const cadastrar: RequestHandler = async (request, response) => {
  const item = await cadastrarItemPit(cadastroItemPitSchema.parse(request.body));
  response
    .status(201)
    .json({ message: 'Item do inventario cadastrado com sucesso.', item: apresentarItemPit(item) });
};
export const editar: RequestHandler = async (request, response) => {
  const { id } = itemPitIdSchema.parse(request.params);
  const item = await editarItemPit(id, edicaoItemPitSchema.parse(request.body));
  response.json({
    message: 'Item do inventario atualizado com sucesso.',
    item: apresentarItemPit(item),
  });
};
export const revisar: RequestHandler = async (request, response) => {
  const { id } = itemPitIdSchema.parse(request.params);
  const { revisaoPrevistaEm } = revisaoItemPitSchema.parse(request.body ?? {});
  const item = await revisarItemPit(id, revisaoPrevistaEm);
  response.json({
    message: 'Revisao do inventario registrada com sucesso.',
    item: apresentarItemPit(item),
  });
};
export const consultar: RequestHandler = async (request, response) => {
  const { id } = itemPitIdSchema.parse(request.params);
  response.json({ item: apresentarItemPit(await buscarItemPit(id)) });
};
export const listar: RequestHandler = async (request, response) => {
  const filtros = listarItensPitSchema.parse(request.query);
  const { itens, total } = await listarItensPit(filtros);
  response.json({
    itens: itens.map(apresentarItemPit),
    paginacao: apresentarPaginacao(filtros.pagina, filtros.limite, total),
  });
};
export const consultarPublico: RequestHandler = async (request, response) => {
  const { id } = itemPitIdSchema.parse(request.params);
  response.json({ item: await buscarItemPitPublico(id) });
};
export const listarPublicos: RequestHandler = async (request, response) => {
  const filtros = listarItensPitPublicosSchema.parse(request.query);
  const { itens, total } = await listarItensPitPublicos(filtros);
  response.json({ itens, paginacao: apresentarPaginacao(filtros.pagina, filtros.limite, total) });
};
