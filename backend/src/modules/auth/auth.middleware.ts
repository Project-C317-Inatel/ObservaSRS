import type { RequestHandler } from 'express';

import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import { buscarAdministradorAutenticado } from './auth.service.js';
import { validarTokenSessao, type SessionPayload } from './auth.token.js';

export const exigirAutenticacao: RequestHandler = async (request, _response, next) => {
  const token = request.cookies[env.AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    next(new AppError(401, 'authentication_required', 'Autenticacao necessaria.'));
    return;
  }

  let sessao: SessionPayload;

  try {
    sessao = validarTokenSessao(token);
  } catch {
    next(new AppError(401, 'invalid_session', 'A sessao e invalida ou expirou.'));
    return;
  }

  const usuario = await buscarAdministradorAutenticado(sessao.sub);
  request.auth = { sub: usuario.id, papel: usuario.papel };
  next();
};

export const exigirSuperAdmin: RequestHandler = (request, _response, next) => {
  if (request.auth?.papel !== 'SUPER_ADMIN') {
    next(
      new AppError(
        403,
        'super_admin_required',
        'Esta operacao exige acesso de super administrador.',
      ),
    );
    return;
  }

  next();
};
