import type { RequestHandler } from 'express';

import {
  cadastroRegistroIndicadorSchema,
  listarRegistrosIndicadoresSchema,
  registroIndicadorIdSchema,
} from './registro-indicador.schemas.js';
import {
  buscarRegistroIndicador,
  cadastrarRegistroIndicador,
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
