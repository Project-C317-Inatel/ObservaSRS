import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CCCF_INITIATIVES, CITY_MILESTONES } from './content';
import { CityPage } from './CityPage';

describe('CityPage', () => {
  it('mostra o título da página e a seção do CCCF', () => {
    render(<CityPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Conheça Santa Rita do Sapucaí' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cidade criativa, cidade feliz' }),
    ).toBeInTheDocument();
  });

  it('mostra todos os marcos da linha do tempo, em ordem', () => {
    render(<CityPage />);

    const linhaDoTempo = screen.getByRole('complementary', { name: 'Linha do tempo' });
    const itens = within(linhaDoTempo).getAllByRole('listitem');

    expect(itens).toHaveLength(CITY_MILESTONES.length);
    expect(itens[0]).toHaveTextContent('1959');
    expect(itens.at(-1)).toHaveTextContent('2024');
  });

  it('mostra um card para cada iniciativa do CCCF', () => {
    render(<CityPage />);

    for (const iniciativa of CCCF_INITIATIVES) {
      expect(screen.getByRole('heading', { level: 3, name: iniciativa.nome })).toBeInTheDocument();
    }
  });
});
