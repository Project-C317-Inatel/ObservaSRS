import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

import { env } from '../../src/config/env.js';
import { loginSchema, registroSchema } from '../../src/modules/auth/auth.schemas.js';
import { criarTokenSessao, validarTokenSessao } from '../../src/modules/auth/auth.token.js';

const id = '11111111-1111-4111-8111-111111111111';

describe('Autenticação e sessão', () => {
  it('normaliza o e-mail no login e preserva os espaços da senha', () => {
    expect(loginSchema.parse({ email: ' ADMIN@teste.local ', senha: ' senha ' })).toEqual({
      email: 'admin@teste.local',
      senha: ' senha ',
    });
  });

  it('recusa senha de cadastro abaixo do mínimo', () => {
    const dados = { nome: 'Novo admin', email: 'admin@teste.local' };
    expect(registroSchema.safeParse({ ...dados, senha: '1234567' }).success).toBe(false);
    expect(registroSchema.safeParse({ ...dados, senha: '12345678' }).success).toBe(true);
  });

  it('preserva a identidade, o papel e a versão em um token válido', () => {
    expect(validarTokenSessao(criarTokenSessao(id, 'EDITOR', 3))).toEqual({
      sub: id,
      papel: 'EDITOR',
      versaoSessao: 3,
    });
  });

  it('recusa um JWT com assinatura de outra chave', () => {
    const token = jwt.sign({ papel: 'SUPER_ADMIN' }, 'outra-chave-de-teste', { subject: id });
    expect(() => validarTokenSessao(token)).toThrow(jwt.JsonWebTokenError);
  });

  it('recusa um JWT expirado mesmo com assinatura válida', () => {
    const token = jwt.sign({ papel: 'ADMIN' }, env.JWT_SECRET, { subject: id, expiresIn: -1 });
    expect(() => validarTokenSessao(token)).toThrow(jwt.TokenExpiredError);
  });

  it('interpreta a versão de um JWT legado como zero', () => {
    const token = jwt.sign({ papel: 'ADMIN' }, env.JWT_SECRET, { subject: id, expiresIn: 60 });
    expect(validarTokenSessao(token).versaoSessao).toBe(0);
  });
});
