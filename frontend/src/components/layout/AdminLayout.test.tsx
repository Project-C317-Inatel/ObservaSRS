import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminSessionStatus } from '../../hooks/useAdminSession';
import type { UserRole } from '../../types';
import { AdminLayout } from './AdminLayout';

const session = {
  status: 'authenticated' as AdminSessionStatus,
  user: {
    id: 'admin-1',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    papel: 'SUPER_ADMIN' as UserRole,
    status: 'APROVADO' as const,
  },
  error: null as string | null,
  logout: vi.fn(),
};

vi.mock('../../hooks/useAdminSession', () => ({
  useAdminSession: () => session,
}));

function renderLayout(path = '/admin') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<p>Conteúdo do início</p>} />
        </Route>
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function menu() {
  return screen.getByRole('navigation', { name: 'Menu do painel' });
}

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.status = 'authenticated';
    session.user.papel = 'SUPER_ADMIN';
    session.error = null;
    session.logout.mockResolvedValue(undefined);
  });

  it('mostra o título, a saudação e a tela da rota atual', () => {
    renderLayout();

    expect(screen.getByRole('heading', { level: 1, name: 'Painel administrativo' })).toBeVisible();
    expect(screen.getByText('Olá, Maria Silva.')).toBeVisible();
    expect(screen.getByText('Conteúdo do início')).toBeVisible();
  });

  it('mostra Solicitações de acesso no menu só para SUPER_ADMIN', () => {
    renderLayout();
    expect(within(menu()).getByRole('link', { name: 'Solicitações de acesso' })).toHaveAttribute(
      'href',
      '/admin/solicitacoes',
    );
  });

  it('esconde Solicitações de acesso do menu para ADMIN', () => {
    session.user.papel = 'ADMIN';
    renderLayout();

    expect(within(menu()).getByRole('link', { name: 'Início' })).toBeVisible();
    expect(
      within(menu()).queryByRole('link', { name: 'Solicitações de acesso' }),
    ).not.toBeInTheDocument();
  });

  it('encerra a sessão e volta para o login ao clicar em Sair', async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(session.logout).toHaveBeenCalledOnce();
    expect(await screen.findByText('Tela de login')).toBeVisible();
  });

  it('mostra um aviso se não conseguir sair', async () => {
    const user = userEvent.setup();
    session.logout.mockRejectedValue(new Error('Falha de rede.'));
    renderLayout();

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
  });

  it('manda para o login quando a sessão não está autenticada', async () => {
    session.status = 'unauthenticated';
    renderLayout();

    await waitFor(() => expect(screen.getByText('Tela de login')).toBeVisible());
  });

  it('informa quando o usuário não tem permissão', () => {
    session.status = 'forbidden';
    renderLayout();

    expect(screen.getByRole('status')).toHaveTextContent('Você não tem permissão');
  });
});
