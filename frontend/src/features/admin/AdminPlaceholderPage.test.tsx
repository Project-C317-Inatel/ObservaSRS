import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminSessionStatus } from '../../hooks/useAdminSession';
import type { UserRole } from '../../types';
import { AdminPlaceholderPage } from './AdminPlaceholderPage';

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

function renderPage(props?: { onLogout?: () => void; onUnauthenticated?: () => void }) {
  return render(
    <MemoryRouter>
      <AdminPlaceholderPage
        onLogout={props?.onLogout ?? vi.fn()}
        onUnauthenticated={props?.onUnauthenticated ?? vi.fn()}
      />
    </MemoryRouter>,
  );
}

describe('AdminPlaceholderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.status = 'authenticated';
    session.user.papel = 'SUPER_ADMIN';
    session.error = null;
    session.logout.mockResolvedValue(undefined);
  });

  it('mostra o título e a saudação do usuário', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Painel administrativo' })).toBeVisible();
    expect(screen.getByText('Olá, Maria Silva.')).toBeVisible();
  });

  it('mostra o link para solicitações de acesso só para SUPER_ADMIN', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Solicitações de acesso' })).toHaveAttribute(
      'href',
      '/admin/solicitacoes',
    );
  });

  it('não mostra o link para solicitações de acesso para ADMIN', () => {
    session.user.papel = 'ADMIN';
    renderPage();

    expect(screen.getByRole('heading', { name: 'Painel administrativo' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Solicitações de acesso' })).not.toBeInTheDocument();
  });

  it('encerra a sessão e avisa quem usa o componente ao clicar em Sair', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    renderPage({ onLogout });

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(onLogout).toHaveBeenCalledOnce());
    expect(session.logout).toHaveBeenCalledOnce();
  });

  it('solicita redirecionamento quando a sessão não está autenticada', async () => {
    const onUnauthenticated = vi.fn();
    session.status = 'unauthenticated';
    renderPage({ onUnauthenticated });

    await waitFor(() => expect(onUnauthenticated).toHaveBeenCalledOnce());
  });

  it('informa quando o usuário não tem permissão', () => {
    session.status = 'forbidden';
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Você não tem permissão');
  });
});
