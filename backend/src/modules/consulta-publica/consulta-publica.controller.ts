import type { RequestHandler } from 'express';

import {
  consultaPublicaIdSchema,
  listarIndicadoresPublicosSchema,
  listarRegistrosPublicosSchema,
  listarSetoresPublicosSchema,
  type PaginacaoPublicaInput,
} from './consulta-publica.schemas.js';
import {
  buscarIndicadorPublico,
  buscarRegistroPublico,
  buscarSetorPublico,
  listarIndicadoresPublicos,
  listarRegistrosPublicos,
  listarSetoresPublicos,
} from './consulta-publica.service.js';

function apresentarPaginacao({ pagina, limite }: PaginacaoPublicaInput, total: number) {
  return { pagina, limite, total, totalPaginas: Math.ceil(total / limite) };
}

function apresentarRegistro(registro: Awaited<ReturnType<typeof buscarRegistroPublico>>) {
  return {
    ...registro,
    periodo: registro.periodo.toISOString().slice(0, 10),
    valor: registro.valor.toFixed(2),
  };
}

export const listarSetores: RequestHandler = async (request, response) => {
  const filtros = listarSetoresPublicosSchema.parse(request.query);
  const { setores, total } = await listarSetoresPublicos(filtros);

  response.status(200).json({ setores, paginacao: apresentarPaginacao(filtros, total) });
};

export const consultarSetor: RequestHandler = async (request, response) => {
  const { id } = consultaPublicaIdSchema.parse(request.params);
  const setor = await buscarSetorPublico(id);

  response.status(200).json({ setor });
};

export const listarIndicadores: RequestHandler = async (request, response) => {
  const filtros = listarIndicadoresPublicosSchema.parse(request.query);
  const { indicadores, total } = await listarIndicadoresPublicos(filtros);

  response.status(200).json({ indicadores, paginacao: apresentarPaginacao(filtros, total) });
};

export const consultarIndicador: RequestHandler = async (request, response) => {
  const { id } = consultaPublicaIdSchema.parse(request.params);
  const indicador = await buscarIndicadorPublico(id);

  response.status(200).json({ indicador });
};

export const listarRegistros: RequestHandler = async (request, response) => {
  const filtros = listarRegistrosPublicosSchema.parse(request.query);
  const { registros, total } = await listarRegistrosPublicos(filtros);

  response.status(200).json({
    registros: registros.map(apresentarRegistro),
    paginacao: apresentarPaginacao(filtros, total),
  });
};

export const consultarRegistro: RequestHandler = async (request, response) => {
  const { id } = consultaPublicaIdSchema.parse(request.params);
  const registro = await buscarRegistroPublico(id);

  response.status(200).json({ registro: apresentarRegistro(registro) });
};
