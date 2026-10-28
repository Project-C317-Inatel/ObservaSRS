import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentUser } from '../../services/auth';
import type { ApiUser } from '../../types';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../../services/auth', () => ({ getCurrentUser: vi.fn() }));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

function usuario(papel: ApiUser['papel']): ApiUser {
  return { id: '1', nome: 'Teste', email: 'teste@exemplo.com', papel, status: 'APROVADO' };
}

function renderRotaProtegida() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/" element={<p>Página inicial</p>} />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route path="/admin" element={<p>Painel administrativo</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockReset();
  });

  it('mostra a página quando o usuário tem o papel permitido', async () => {
    mockedGetCurrentUser.mockResolvedValue({ usuario: usuario('SUPER_ADMIN') });
    renderRotaProtegida();

    expect(screen.getByRole('status')).toHaveTextContent('Verificando acesso');
    expect(await screen.findByText('Painel administrativo')).toBeInTheDocument();
  });

  it('manda para o login quando não há sessão', async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error('401'));
    renderRotaProtegida();

    expect(await screen.findByText('Página de login')).toBeInTheDocument();
  });

  it('volta para o início quando o papel não tem permissão', async () => {
    mockedGetCurrentUser.mockResolvedValue({ usuario: usuario('EDITOR') });
    renderRotaProtegida();

    expect(await screen.findByText('Página inicial')).toBeInTheDocument();
  });
});
