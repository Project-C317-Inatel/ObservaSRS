import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../services/fallback', () => ({
  isMockMode: vi.fn(() => false),
  shouldUseFallback: vi.fn(() => false),
}));

vi.mock('../../services/pit', () => ({
  listarItensPit: vi.fn(),
}));

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarItensPit } from '../../services/pit';
import { PIT_ITEMS } from './data';
import { usePit } from './usePit';

const mockIsMockMode = vi.mocked(isMockMode);
const mockShouldUseFallback = vi.mocked(shouldUseFallback);
const mockListarItensPit = vi.mocked(listarItensPit);

beforeEach(() => {
  vi.clearAllMocks();
  mockIsMockMode.mockReturnValue(false);
  mockShouldUseFallback.mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Cenário 1: sucesso da API
// ---------------------------------------------------------------------------

describe('usePit — cenário 1: sucesso da API', () => {
  it('busca itens da API e retorna status ready', async () => {
    const itensApi = [
      {
        id: 'pit-1',
        nome: 'Parque Teste',
        categoria: 'Parque Urbano' as const,
        descricao: 'Desc',
        imagemUrl: null,
        localizacao: 'Centro',
        atualizadoEm: '2026-01-01',
      },
    ];
    mockListarItensPit.mockResolvedValue({ itens: itensApi });

    const { result } = renderHook(() => usePit());

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(mockListarItensPit).toHaveBeenCalledOnce();
    expect(result.current.items).toEqual(itensApi);
    expect(result.current.error).toBeNull();
  });

  it('filtra itens por categoria via setCategory', async () => {
    mockListarItensPit.mockResolvedValue({ itens: PIT_ITEMS as never });

    const { result } = renderHook(() => usePit());

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.items).toHaveLength(PIT_ITEMS.length);

    act(() => {
      result.current.setCategory('Gastronomia');
    });

    expect(result.current.activeCategory).toBe('Gastronomia');
    expect(result.current.items.every((item) => item.categoria === 'Gastronomia')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Cenário 2: flag de mock ativa
// ---------------------------------------------------------------------------

describe('usePit — cenário 2: flag de mock ativa', () => {
  it('retorna PIT_ITEMS sem chamar a API quando isMockMode() é true', async () => {
    mockIsMockMode.mockReturnValue(true);

    const { result } = renderHook(() => usePit());

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(mockListarItensPit).not.toHaveBeenCalled();
    expect(result.current.items).toBe(PIT_ITEMS);
    expect(result.current.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cenário 3: erro da API em desenvolvimento (shouldUseFallback = true)
// ---------------------------------------------------------------------------

describe('usePit — cenário 3: erro da API em desenvolvimento', () => {
  it('aplica fallback para PIT_ITEMS com status ready em caso de falha', async () => {
    mockShouldUseFallback.mockReturnValue(true);
    mockListarItensPit.mockRejectedValue(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { result } = renderHook(() => usePit());

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.items).toBe(PIT_ITEMS);
    expect(result.current.error).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Cenário 4: erro da API em produção (shouldUseFallback = false)
// ---------------------------------------------------------------------------

describe('usePit — cenário 4: erro da API em produção', () => {
  it('retorna status error sem usar dados fixos em produção', async () => {
    mockShouldUseFallback.mockReturnValue(false);
    mockListarItensPit.mockRejectedValue(new Error('500 Internal Server Error'));

    const { result } = renderHook(() => usePit());

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.items).toEqual([]);
  });
});
