import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { COLETA_NAV, LOGIN_NAV, PUBLIC_NAV } from '../../routes';
import { Header } from './Header';

const TODOS_OS_LINKS = [...PUBLIC_NAV, COLETA_NAV, LOGIN_NAV];

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

function navPrincipal() {
  return screen.getByRole('navigation', { name: 'Navegação principal' });
}

describe('Header', () => {
  it('mostra todos os links de navegação com o caminho certo', () => {
    renderHeader();

    for (const item of TODOS_OS_LINKS) {
      expect(within(navPrincipal()).getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        item.path,
      );
    }
  });

  it('marca como ativo só o link da rota atual', () => {
    renderHeader('/inventario');

    expect(within(navPrincipal()).getByRole('link', { name: 'Inventário PIT' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(navPrincipal()).getByRole('link', { name: 'Indicadores' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('abre o menu mobile e fecha ao clicar em um link', () => {
    renderHeader();

    const botao = screen.getByRole('button', { name: 'Menu' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(botao);
    const navMobile = screen.getByRole('navigation', { name: 'Navegação principal (mobile)' });
    expect(within(navMobile).getAllByRole('link')).toHaveLength(TODOS_OS_LINKS.length);

    fireEvent.click(within(navMobile).getByRole('link', { name: 'Coleta' }));
    expect(
      screen.queryByRole('navigation', { name: 'Navegação principal (mobile)' }),
    ).not.toBeInTheDocument();
  });
});
