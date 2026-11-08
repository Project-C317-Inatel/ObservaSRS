import type { Express } from 'express';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UsuarioAdmin } from '../src/generated/prisma/client.js';

const database = vi.hoisted(() => ({
  findUnique:
    vi.fn<(args: { where: { email?: string; id?: string } }) => Promise<UsuarioAdmin | null>>(),
  update: vi.fn(),
}));

vi.mock('../src/shared/database/prisma.js', () => ({
  prisma: { usuarioAdmin: database },
}));

const senha = 'SenhaDeTeste123';
let senhaHash: string;
let app: Express;

function criarUsuario(overrides: Partial<UsuarioAdmin> = {}): UsuarioAdmin {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'Administrador de Teste',
    email: 'admin@teste.local',
    senhaHash,
    papel: 'ADMIN',
    status: 'APROVADO',
    ativo: true,
    versaoSessao: 0,
    avaliadoEm: null,
    avaliadoPorId: null,
    criadoEm: new Date('2026-01-01T00:00:00Z'),
    atualizadoEm: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

beforeAll(async () => {
  senhaHash = await hash(senha, 4);
});

beforeEach(async () => {
  vi.resetAllMocks();
  // Cada teste recebe novos limitadores de requisicoes, preservando as regras da API.
  vi.resetModules();
  ({ app } = await import('../src/app.js'));
});

describe('Autenticacao SMCELT', () => {
  it('Login com credenciais corretas retorna 200 e cria o cookie de sessao', async () => {
    const usuario = criarUsuario();
    database.findUnique.mockResolvedValue(usuario);
    const agente = request.agent(app);

    const login = await agente.post('/auth/login').send({ email: usuario.email, senha });

    expect(login.status).toBe(200);
    expect(login.body.usuario).toEqual({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: 'ADMIN',
      status: 'APROVADO',
    });
    expect(JSON.stringify(login.body)).not.toContain(senhaHash);
    const cookies = login.headers['set-cookie'] as unknown as string[];
    expect(cookies).toEqual([
      expect.stringMatching(/^observasrs_sessao=.+;.*HttpOnly.*SameSite=Lax/),
    ]);

    const sessao = await agente.get('/auth/me');
    expect(sessao.status).toBe(200);
    expect(sessao.body.usuario.id).toBe(usuario.id);
    expect(database.findUnique).toHaveBeenCalledWith({ where: { id: usuario.id } });

    database.findUnique.mockResolvedValue({ ...usuario, ativo: false, versaoSessao: 1 });
    expect((await agente.get('/auth/me')).status).toBe(401);

    database.findUnique.mockResolvedValue({ ...usuario, versaoSessao: 2 });
    const sessaoAntiga = await agente.get('/auth/me');
    expect(sessaoAntiga.status).toBe(401);
    expect(sessaoAntiga.body.error).toBe('invalid_session');

    const novoLogin = await agente.post('/auth/login').send({ email: usuario.email, senha });
    expect(novoLogin.status).toBe(200);
    expect((await agente.get('/auth/me')).status).toBe(200);
  });

  it('Senha incorreta retorna 401', async () => {
    const usuario = criarUsuario();
    database.findUnique.mockResolvedValue(usuario);

    const resposta = await request(app)
      .post('/auth/login')
      .send({ email: usuario.email, senha: 'SenhaIncorreta123' });

    expect(resposta.status).toBe(401);
    expect(resposta.body.error).toBe('invalid_credentials');
    expect(resposta.headers['set-cookie']).toBeUndefined();
  });

  it('Conta pendente ou rejeitada nao consegue entrar', async () => {
    for (const { status, erro } of [
      { status: 'PENDENTE', erro: 'account_pending' },
      { status: 'REJEITADO', erro: 'account_rejected' },
    ] as const) {
      const usuario = criarUsuario({ status, ativo: false });
      database.findUnique.mockResolvedValue(usuario);

      const resposta = await request(app).post('/auth/login').send({ email: usuario.email, senha });

      expect(resposta.status).toBe(403);
      expect(resposta.body.error).toBe(erro);
      expect(resposta.headers['set-cookie']).toBeUndefined();
    }
  });

  it('Apenas o super administrador consegue aprovar ou rejeitar contas', async () => {
    const solicitacaoId = '22222222-2222-4222-8222-222222222222';

    for (const papel of ['ADMIN', 'EDITOR'] as const) {
      vi.resetAllMocks();
      const usuario = criarUsuario({ papel });
      database.findUnique.mockResolvedValue(usuario);
      const agente = request.agent(app);
      const login = await agente.post('/auth/login').send({ email: usuario.email, senha });
      expect(login.status).toBe(200);

      for (const acao of ['aprovar', 'rejeitar']) {
        const resposta = await agente.patch(`/admin/solicitacoes/${solicitacaoId}/${acao}`);

        expect(resposta.status).toBe(403);
        expect(resposta.body.error).toBe('super_admin_required');
        expect(database.findUnique).not.toHaveBeenCalledWith({ where: { id: solicitacaoId } });
        expect(database.update).not.toHaveBeenCalled();
      }
    }

    for (const { acao, status, ativo } of [
      { acao: 'aprovar', status: 'APROVADO', ativo: true },
      { acao: 'rejeitar', status: 'REJEITADO', ativo: false },
    ] as const) {
      vi.resetAllMocks();
      const superAdmin = criarUsuario({ papel: 'SUPER_ADMIN' });
      const pendente = criarUsuario({
        id: solicitacaoId,
        email: 'solicitacao@teste.local',
        status: 'PENDENTE',
        ativo: false,
      });
      database.findUnique.mockImplementation(async ({ where }) =>
        where.id === solicitacaoId ? pendente : superAdmin,
      );
      database.update.mockResolvedValue({
        id: solicitacaoId,
        status,
        ativo,
        avaliadoEm: new Date(),
        avaliadoPorId: superAdmin.id,
      });
      const agente = request.agent(app);
      const login = await agente.post('/auth/login').send({ email: superAdmin.email, senha });
      expect(login.status).toBe(200);

      const resposta = await agente.patch(`/admin/solicitacoes/${solicitacaoId}/${acao}`);

      expect(resposta.status).toBe(200);
      expect(database.update).toHaveBeenCalledTimes(1);
      expect(database.update).toHaveBeenCalledWith({
        where: { id: solicitacaoId, status: 'PENDENTE', papel: { not: 'SUPER_ADMIN' } },
        data: {
          status,
          ativo,
          avaliadoEm: expect.any(Date),
          avaliadoPorId: superAdmin.id,
        },
        select: expect.objectContaining({ id: true, status: true }),
      });
      expect(database.update.mock.calls[0]?.[0].select).not.toHaveProperty('senhaHash');
      expect(resposta.body.solicitacao).toMatchObject({
        id: solicitacaoId,
        status,
        ativo,
        avaliadoPorId: superAdmin.id,
      });
    }
  });

  it('Acesso a uma rota protegida sem login retorna 401', async () => {
    const resposta = await request(app).get('/admin/solicitacoes');

    expect(resposta.status).toBe(401);
    expect(resposta.body.error).toBe('authentication_required');
    expect(database.findUnique).not.toHaveBeenCalled();
    expect(database.update).not.toHaveBeenCalled();
  });
});
