import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import App from './App';

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

describe('App — navegação pública', () => {
  it('mostra hero, indicadores, relatórios e rodapé na página inicial', () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: 'Observa SRS' })).toBeInTheDocument();
    expect(screen.getByText('Leitos ocupados')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Relatórios públicos' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Dados abertos');
  });

  it('troca de página pelo menu e marca o link ativo', () => {
    renderApp();

    clicarNoMenu('Inventário PIT');

    expect(
      screen.getByRole('heading', { name: 'PIT — Plano de Inventário Turístico' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inventário PIT' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    clicarNoMenu('Cadastur/FNRH');
    expect(screen.getByRole('heading', { name: 'Cadastur & FNRH Digital' })).toBeInTheDocument();
  });

  it('abre direto a página pela URL', () => {
    renderApp('/coleta');
    expect(screen.getByRole('heading', { name: /Informe os dados/ })).toBeInTheDocument();
  });

  it('redireciona para a página inicial quando a URL não existe', () => {
    renderApp('/pagina-que-nao-existe');
    expect(screen.getByRole('heading', { level: 1, name: 'Observa SRS' })).toBeInTheDocument();
  });
});