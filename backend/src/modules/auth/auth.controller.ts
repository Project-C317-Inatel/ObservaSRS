import type { RequestHandler } from 'express';

import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import { loginSchema, registroSchema } from './auth.schemas.js';
import {
  autenticarAdministrador,
  buscarAdministradorAutenticado,
  registrarSolicitacaoAdministrador,
} from './auth.service.js';
import { criarTokenSessao, sessionCookieClearOptions, sessionCookieOptions } from './auth.token.js';

function apresentarUsuario(usuario: {
  id: string;
  nome: string;
  email: string;
  papel: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
}) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    status: usuario.status,
  };
}

export const registro: RequestHandler = async (request, response) => {
  const dados = registroSchema.parse(request.body);
  const usuario = await registrarSolicitacaoAdministrador(dados);

  response.status(201).json({
    message: 'Solicitacao enviada para aprovacao do super administrador.',
    solicitacao: apresentarUsuario(usuario),
  });
};

export const login: RequestHandler = async (request, response) => {
  const credenciais = loginSchema.parse(request.body);
  const usuario = await autenticarAdministrador(credenciais);
  const token = criarTokenSessao(usuario.id, usuario.papel);

  response.cookie(env.AUTH_COOKIE_NAME, token, sessionCookieOptions);
  response.status(200).json({
    usuario: apresentarUsuario(usuario),
  });
};

export const me: RequestHandler = async (request, response) => {
  if (!request.auth) {
    throw new AppError(401, 'authentication_required', 'Autenticacao necessaria.');
  }

  const usuario = await buscarAdministradorAutenticado(request.auth.sub);

  response.status(200).json({
    usuario: apresentarUsuario(usuario),
  });
};

export const logout: RequestHandler = (_request, response) => {
  response.clearCookie(env.AUTH_COOKIE_NAME, sessionCookieClearOptions);
  response.status(204).send();
};
