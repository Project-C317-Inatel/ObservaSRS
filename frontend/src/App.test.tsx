import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import App from './App';

vi.mock('./features/admin/AdminPage', () => ({
  AdminPage: (props: { onLogout: () => void; onUnauthenticated: () => void }) => (
    <>
      <button onClick={props.onLogout}>Sair mockado</button>
      <button onClick={props.onUnauthenticated}>Sessão expirada mockada</button>
    </>
  ),
}));

vi.mock('./components/routing/ProtectedRoute', () => ({
  ProtectedRoute: () => <Outlet />,
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
  it('mostra a página inicial pública', () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: 'Observa SRS' })).toBeInTheDocument();
    expect(screen.getByText('Leitos ocupados')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Relatórios públicos' })).toBeInTheDocument();
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

  it('renderiza o painel administrativo na rota protegida', () => {
    renderApp('/admin');

    expect(screen.getByRole('button', { name: 'Sair mockado' })).toBeInTheDocument();
  });
});
