import { randomUUID } from 'node:crypto';
import { hash } from 'bcryptjs';

import type { PapelAdmin } from '../../src/generated/prisma/client.js';
import { prisma } from '../../src/shared/database/prisma.js';

export const senhaTeste = 'SenhaFicticia123';

export async function criarContaAprovada(papel: PapelAdmin = 'ADMIN') {
  return prisma.usuarioAdmin.create({
    data: {
      nome: 'Conta de teste',
      email: `${randomUUID()}@teste.local`,
      senhaHash: await hash(senhaTeste, 4),
      papel,
      status: 'APROVADO',
      ativo: true,
    },
  });
}
