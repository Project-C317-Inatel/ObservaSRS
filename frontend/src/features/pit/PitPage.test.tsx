import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/pit', () => ({
  listarItensPit: vi.fn(),
}));

vi.mock('../../services/fallback', () => ({
  isMockMode: vi.fn(() => false),
  shouldUseFallback: vi.fn(() => false),
}));

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarItensPit } from '../../services/pit';
import { PitPage } from './PitPage';
import { PIT_ITEMS, filterPitItems, formatPitDate } from './data';

const mockListarItensPit = vi.mocked(listarItensPit);
const mockIsMockMode = vi.mocked(isMockMode);
const mockShouldUseFallback = vi.mocked(shouldUseFallback);

describe('Inventário PIT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMockMode.mockReturnValue(false);
    mockShouldUseFallback.mockReturnValue(false);
    mockListarItensPit.mockResolvedValue({ itens: [...PIT_ITEMS] });
  });

  it('mostra carregando e depois todos os itens, permitindo filtrar por categoria', async () => {
    render(<PitPage />);

    expect(screen.getByText(/Carregando inventário/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(PIT_ITEMS.length);
    });

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

  it('mostra mensagem quando a categoria ou prop items não tem itens', () => {
    render(<PitPage items={[]} />);
    expect(screen.getByText('Nenhum item cadastrado nesta categoria.')).toBeInTheDocument();
  });

  it('mostra mensagem de erro quando a API falha em produção', async () => {
    mockListarItensPit.mockRejectedValue(new Error('Falha de conexão com o servidor'));

    render(<PitPage />);

    await waitFor(() => {
      expect(screen.getByText(/Falha de conexão com o servidor/)).toBeInTheDocument();
    });
  });

  it('filtra e formata datas corretamente com id string', () => {
    expect(filterPitItems(PIT_ITEMS, null)).toHaveLength(PIT_ITEMS.length);
    expect(filterPitItems(PIT_ITEMS, 'Parque Urbano').map((item) => item.id)).toEqual(['1']);
    expect(formatPitDate('2025-08-12')).toBe('12/08/2025');
  });
});
