import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PitPage } from './PitPage';
import { PIT_ITEMS, filterPitItems, formatPitDate } from './data';

describe('Inventário PIT', () => {
  it('mostra todos os itens e filtra por categoria', () => {
    render(<PitPage />);

    expect(screen.getAllByRole('listitem')).toHaveLength(PIT_ITEMS.length);

    fireEvent.click(screen.getByRole('button', { name: 'Gastronomia' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Gastrô Festival Mantiqueira')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gastronomia' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(PIT_ITEMS.length);
  });

  it('mostra mensagem quando a categoria não tem itens', () => {
    render(<PitPage items={[]} />);
    expect(screen.getByText('Nenhum item cadastrado nesta categoria.')).toBeInTheDocument();
  });

  it('filtra e formata datas corretamente', () => {
    expect(filterPitItems(PIT_ITEMS, null)).toHaveLength(PIT_ITEMS.length);
    expect(filterPitItems(PIT_ITEMS, 'Parque Urbano').map((item) => item.id)).toEqual([1]);
    expect(formatPitDate('2025-08-12')).toBe('12/08/2025');
  });
});
