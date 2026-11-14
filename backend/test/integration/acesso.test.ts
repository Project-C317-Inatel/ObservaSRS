import { compare } from 'bcryptjs';
import { afterAll, describe, expect, it } from 'vitest';

import { desativarConta, reativarConta } from '../../src/modules/admin/admin.service.js';
import { registroSchema } from '../../src/modules/auth/auth.schemas.js';
import { registrarSolicitacaoAdministrador } from '../../src/modules/auth/auth.service.js';
import { prisma } from '../../src/shared/database/prisma.js';
import { criarContaAprovada, senhaTeste } from '../fixtures/usuario.js';

afterAll(() => prisma.$disconnect());

describe('Acesso administrativo com PostgreSQL', () => {
  it('grava a conta como pendente e guarda a senha como hash bcrypt', async () => {
    const dados = registroSchema.parse({
      nome: 'Solicitante',
      email: ' PENDENTE@teste.local ',
      senha: senhaTeste,
    });
    const criada = await registrarSolicitacaoAdministrador(dados);

    const conta = await prisma.usuarioAdmin.findUniqueOrThrow({ where: { id: criada.id } });
    expect(conta).toMatchObject({
      email: 'pendente@teste.local',
      papel: 'ADMIN',
      status: 'PENDENTE',
      ativo: false,
    });
    expect(conta.senhaHash).not.toBe(senhaTeste);
    expect(await compare(senhaTeste, conta.senhaHash)).toBe(true);
  });

  it('recusa uma segunda solicitação com o mesmo e-mail normalizado', async () => {
    const dados = {
      nome: 'Solicitante duplicado',
      email: 'duplicado@teste.local',
      senha: senhaTeste,
    };
    await registrarSolicitacaoAdministrador(registroSchema.parse(dados));

    const repetida = registroSchema.parse({ ...dados, email: ' DUPLICADO@teste.local ' });
    await expect(registrarSolicitacaoAdministrador(repetida)).rejects.toMatchObject({
      statusCode: 409,
      code: 'email_already_registered',
    });
    expect(await prisma.usuarioAdmin.count({ where: { email: dados.email } })).toBe(1);
  });

  it('incrementa a versão da sessão somente quando o estado de acesso muda', async () => {
    const superAdmin = await criarContaAprovada('SUPER_ADMIN');
    const admin = await criarContaAprovada();

    await desativarConta(admin.id, superAdmin.id);
    await desativarConta(admin.id, superAdmin.id);
    await expect(
      prisma.usuarioAdmin.findUniqueOrThrow({ where: { id: admin.id } }),
    ).resolves.toMatchObject({ ativo: false, versaoSessao: 1 });

    await reativarConta(admin.id, superAdmin.id);
    await expect(
      prisma.usuarioAdmin.findUniqueOrThrow({ where: { id: admin.id } }),
    ).resolves.toMatchObject({ ativo: true, versaoSessao: 2 });
  });
});
