import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import type { PapelAdmin } from '../../generated/prisma/client.js';
import { env } from '../../config/env.js';

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  papel: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),
});

export type SessionPayload = z.infer<typeof tokenPayloadSchema>;

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: env.JWT_EXPIRES_IN_SECONDS * 1000,
  path: '/',
};

export const sessionCookieClearOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export function criarTokenSessao(usuarioId: string, papel: PapelAdmin): string {
  return jwt.sign({ papel }, env.JWT_SECRET, {
    subject: usuarioId,
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
  });
}

export function validarTokenSessao(token: string): SessionPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);
  return tokenPayloadSchema.parse(payload);
}
