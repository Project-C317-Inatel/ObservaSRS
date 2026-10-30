import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Navigate, Outlet } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import type { UserRole } from './types';

/** Papel da sessão simulada; `null` representa usuário anônimo. */
const sessao = vi.hoisted(() => ({ papel: null as UserRole | null }));

vi.mock('./features/admin/AdminPage', () => ({
  AdminPage: (props: { onLogout: () => void; onUnauthenticated: () => void }) => (
    <>
      <p>Solicitações mockadas</p>
      <button onClick={props.onLogout}>Sair mockado</button>
      <button onClick={props.onUnauthenticated}>Sessão expirada mockada</button>
    </>
  ),
}));

vi.mock('./features/admin/AdminPlaceholderPage', () => ({
  AdminPlaceholderPage: () => <p>Painel administrativo mockado</p>,
}));

// Reproduz a regra real do ProtectedRoute para validar os papéis configurados em cada rota.
vi.mock('./components/routing/ProtectedRoute', () => ({
  ProtectedRoute: ({ allowedRoles = [] }: { allowedRoles?: readonly UserRole[] }) => {
    if (sessao.papel === null) return <Navigate to="/login" replace />;
    if (allowedRoles.length > 0 && !allowedRoles.includes(sessao.papel)) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  },
}));

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function clicarNoMenu(nomeDoLink: string) {
  const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
  fireEvent.click(within(nav).getByRole('link', { name: nomeDoLink }));
}

describe('App', () => {
  beforeEach(() => {
    sessao.papel = null;
  });

  it('mostra a página inicial pública', async () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: 'Observa SRS' })).toBeInTheDocument();
    expect(await screen.findByText('Leitos ocupados')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Relatórios públicos' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Dados abertos');
  });

  it('navega pelas páginas públicas', () => {
    renderApp();

    clicarNoMenu('Inventário PIT');
    expect(
      screen.getByRole('heading', { name: 'PIT — Plano de Inventário Turístico' }),
    ).toBeInTheDocument();

    clicarNoMenu('Cadastur/FNRH');
    expect(screen.getByRole('heading', { name: 'Cadastur & FNRH Digital' })).toBeInTheDocument();
  });

  it('abre diretamente uma página pública pela URL', () => {
    renderApp('/coleta');

    expect(screen.getByRole('heading', { name: /Informe os dados/ })).toBeInTheDocument();
  });

  it('redireciona URLs desconhecidas para a página inicial', () => {
    renderApp('/pagina-que-nao-existe');

    expect(screen.getByRole('heading', { level: 1, name: 'Observa SRS' })).toBeInTheDocument();
  });

  it('libera o painel em /admin para ADMIN', () => {
    sessao.papel = 'ADMIN';
    renderApp('/admin');

    expect(screen.getByText('Painel administrativo mockado')).toBeInTheDocument();
  });

  it('libera o painel em /admin para SUPER_ADMIN', () => {
    sessao.papel = 'SUPER_ADMIN';
    renderApp('/admin');

    expect(screen.getByText('Painel administrativo mockado')).toBeInTheDocument();
  });

  it('redireciona ADMIN para a página inicial ao abrir /admin/solicitacoes', () => {
    sessao.papel = 'ADMIN';
    renderApp('/admin/solicitacoes');

    expect(screen.queryByText('Solicitações mockadas')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Observa SRS' })).toBeInTheDocument();
  });

  it('libera /admin/solicitacoes para SUPER_ADMIN', () => {
    sessao.papel = 'SUPER_ADMIN';
    renderApp('/admin/solicitacoes');

    expect(screen.getByText('Solicitações mockadas')).toBeInTheDocument();
  });

  it('redireciona usuário anônimo para o login ao abrir rotas do painel', () => {
    renderApp('/admin');
    expect(screen.getByRole('region', { name: 'Login da SMCELT' })).toBeInTheDocument();

    renderApp('/admin/solicitacoes');
    expect(screen.getAllByRole('region', { name: 'Login da SMCELT' }).length).toBeGreaterThan(0);
  });
});
