import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import { z } from 'zod';

import { PrismaClient } from '../src/generated/prisma/client.js';

const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SUPER_ADMIN_SEED_NOME: z.string().min(2),
  SUPER_ADMIN_SEED_EMAIL: z.string().email(),
  SUPER_ADMIN_SEED_SENHA: z.string().min(8),
});

const seedEnv = seedEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SUPER_ADMIN_SEED_NOME: process.env.SUPER_ADMIN_SEED_NOME ?? process.env.ADMIN_SEED_NOME,
  SUPER_ADMIN_SEED_EMAIL: process.env.SUPER_ADMIN_SEED_EMAIL ?? process.env.ADMIN_SEED_EMAIL,
  SUPER_ADMIN_SEED_SENHA: process.env.SUPER_ADMIN_SEED_SENHA ?? process.env.ADMIN_SEED_SENHA,
});
const adapter = new PrismaPg({ connectionString: seedEnv.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const email = seedEnv.SUPER_ADMIN_SEED_EMAIL.trim().toLowerCase();
  const senhaHash = await hash(seedEnv.SUPER_ADMIN_SEED_SENHA, 12);

  await prisma.usuarioAdmin.upsert({
    where: { email },
    update: {
      nome: seedEnv.SUPER_ADMIN_SEED_NOME,
      senhaHash,
      papel: 'SUPER_ADMIN',
      status: 'APROVADO',
      ativo: true,
      avaliadoEm: new Date(),
      avaliadoPorId: null,
    },
    create: {
      nome: seedEnv.SUPER_ADMIN_SEED_NOME,
      email,
      senhaHash,
      papel: 'SUPER_ADMIN',
      status: 'APROVADO',
      ativo: true,
      avaliadoEm: new Date(),
    },
  });

  console.log(`Super administrador preparado: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error('Nao foi possivel criar o super administrador inicial.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
