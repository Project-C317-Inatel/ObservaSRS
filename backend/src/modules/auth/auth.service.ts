import { compare, hash } from 'bcryptjs';

import { AppError } from '../../shared/errors/app-error.js';
import { prisma } from '../../shared/database/prisma.js';
import type { LoginInput, RegistroInput } from './auth.schemas.js';

export async function registrarSolicitacaoAdministrador({ nome, email, senha }: RegistroInput) {
  const contaExistente = await prisma.usuarioAdmin.findUnique({
    where: { email },
  });

  if (contaExistente) {
    throw new AppError(
      409,
      'email_already_registered',
      'Ja existe uma solicitacao ou conta com este e-mail.',
    );
  }

  const senhaHash = await hash(senha, 12);

  return prisma.usuarioAdmin.create({
    data: {
      nome,
      email,
      senhaHash,
      papel: 'ADMIN',
      status: 'PENDENTE',
      ativo: false,
    },
  });
}

export async function autenticarAdministrador({ email, senha }: LoginInput) {
  const usuario = await prisma.usuarioAdmin.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new AppError(401, 'invalid_credentials', 'E-mail ou senha invalidos.');
  }

  const senhaCorreta = await compare(senha, usuario.senhaHash);

  if (!senhaCorreta) {
    throw new AppError(401, 'invalid_credentials', 'E-mail ou senha invalidos.');
  }

  if (usuario.status === 'PENDENTE') {
    throw new AppError(
      403,
      'account_pending',
      'Sua solicitacao ainda aguarda aprovacao do super administrador.',
    );
  }

  if (usuario.status === 'REJEITADO') {
    throw new AppError(
      403,
      'account_rejected',
      'Sua solicitacao de acesso foi rejeitada. Entre em contato com a SMCELT.',
    );
  }

  if (!usuario.ativo) {
    throw new AppError(403, 'account_inactive', 'Esta conta esta desativada.');
  }

  return usuario;
}

export async function buscarAdministradorAutenticado(id: string) {
  const usuario = await prisma.usuarioAdmin.findUnique({
    where: { id },
  });

  if (!usuario || !usuario.ativo || usuario.status !== 'APROVADO') {
    throw new AppError(401, 'invalid_session', 'A sessao nao e mais valida.');
  }

  return usuario;
}
