import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { useIndicators } from './useIndicators';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../services/fallback', () => ({
  isMockMode: vi.fn(() => false),
  shouldUseFallback: vi.fn(() => false),
}));

vi.mock('../../services/indicadores', () => ({
  listarRegistrosPublicados: vi.fn(),
}));

vi.mock('./adapter', () => ({
  adaptIndicatorRecords: vi.fn((r: unknown[]) => r),
  adaptarRegistrosIndicadores: vi.fn((r: unknown[]) => r),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarRegistrosPublicados } from '../../services/indicadores';
import { adaptIndicatorRecords } from './adapter';
import { INDICATOR_DATA } from './data';
import { registroPublico } from '../../test/fixtures';

const mockIsMockMode = vi.mocked(isMockMode);
const mockShouldUseFallback = vi.mocked(shouldUseFallback);
const mockListarRegistrosPublicados = vi.mocked(listarRegistrosPublicados);
const mockAdaptIndicatorRecords = vi.mocked(adaptIndicatorRecords);

beforeEach(() => {
  vi.clearAllMocks();
  mockIsMockMode.mockReturnValue(false);
  mockShouldUseFallback.mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests with explicit records (existing behaviour — deve continuar a funcionar)
// ---------------------------------------------------------------------------

describe('useIndicators — registros explícitos (comportamento legado)', () => {
  it('calcula a visão inicial com os dados demonstrativos', () => {
    const { result } = renderHook(() => useIndicators({ records: INDICATOR_DATA }));

    expect(result.current.status).toBe('ready');
    expect(result.current.chartType).toBe('bar');
    expect(result.current.options.years).toEqual([2025, 2026]);
    expect(result.current.visitorFlow).toHaveLength(4);
    expect(result.current.secondaryCards.map((card) => card.id)).toEqual([
      'overnightStays',
      'occupancyRate',
      'averageStay',
    ]);
    expect(result.current.error).toBeNull();
  });

  it('mantém filtros globais e deriva novamente fluxo e cards', async () => {
    const { result } = renderHook(() => useIndicators({ records: INDICATOR_DATA }));

    act(() => {
      result.current.setFilters({ year: 2026, sector: 'Hotelaria' });
      result.current.setChartType('line');
    });

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.filters).toEqual({
      year: 2026,
      period: null,
      sector: 'Hotelaria',
    });
    expect(result.current.chartType).toBe('line');
    expect(result.current.visitorFlow).toEqual([
      { label: '2026-01', value: 1510 },
      { label: '2026-02', value: 1640 },
    ]);
    expect(result.current.secondaryCards[0]?.value).toBe(2130);
  });

  it('permite alterar um filtro e resetar todos os filtros', async () => {
    const { result } = renderHook(() => useIndicators({ records: INDICATOR_DATA }));

    act(() => {
      result.current.setFilter('period', '2025-01');
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.filters.period).toBe('2025-01');

    act(() => {
      result.current.resetFilters();
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.filters).toEqual({
      year: null,
      period: null,
      sector: null,
    });
  });

  it('expõe loading antes de publicar a nova derivação dos filtros', async () => {
    const { result } = renderHook(() => useIndicators({ records: INDICATOR_DATA }));

    act(() => {
      result.current.setFilter('year', 2030);
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.visitorFlow).toEqual([]);
    expect(result.current.secondaryCards).toEqual([]);

    await waitFor(() => expect(result.current.status).toBe('empty'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEmpty).toBe(true);
  });

  it('explicita o estado vazio sem consultar backend', () => {
    const { result } = renderHook(() => useIndicators({ records: [] }));

    expect(result.current.status).toBe('empty');
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.visitorFlow).toEqual([]);
    expect(result.current.secondaryCards.every((card) => card.value === null)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Cenário 1: sucesso da API — converte registros pelo adaptador
// ---------------------------------------------------------------------------

describe('useIndicators — cenário 1: sucesso da API', () => {
  it('busca registros da API, adapta e exibe status ready', async () => {
    const registrosApi = [registroPublico('Visitantes', '500.00')];

    const adaptedRecords = [
      { period: '2026-01', year: 2026, sector: 'Hotelaria', visitors: 500, secondaryMetrics: {} },
    ];

    mockListarRegistrosPublicados.mockResolvedValue({ registros: registrosApi });
    mockAdaptIndicatorRecords.mockReturnValue(
      adaptedRecords as ReturnType<typeof adaptIndicatorRecords>,
    );

    const { result } = renderHook(() => useIndicators());

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).not.toBe('loading'));

    expect(mockListarRegistrosPublicados).toHaveBeenCalledOnce();
    expect(mockAdaptIndicatorRecords).toHaveBeenCalledWith(registrosApi);
    expect(result.current.status).toMatch(/^(ready|empty)$/);
    expect(result.current.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cenário 2: flag de mock ativa — retorna INDICATOR_DATA imediatamente
// ---------------------------------------------------------------------------

describe('useIndicators — cenário 2: flag de mock ativa', () => {
  it('retorna INDICATOR_DATA sem chamar a API quando isMockMode() é true', async () => {
    mockIsMockMode.mockReturnValue(true);
    mockAdaptIndicatorRecords.mockReturnValue(
      INDICATOR_DATA as ReturnType<typeof adaptIndicatorRecords>,
    );

    const { result } = renderHook(() => useIndicators());

    await waitFor(() => expect(result.current.status).not.toBe('loading'));

    expect(mockListarRegistrosPublicados).not.toHaveBeenCalled();
    expect(result.current.status).toBe('ready');
    expect(result.current.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cenário 3: erro da API em desenvolvimento (shouldUseFallback = true)
// ---------------------------------------------------------------------------

describe('useIndicators — cenário 3: erro da API em desenvolvimento', () => {
  it('aplica fallback para INDICATOR_DATA com status ready em caso de falha', async () => {
    mockShouldUseFallback.mockReturnValue(true);
    mockListarRegistrosPublicados.mockRejectedValue(new Error('Network error'));
    mockAdaptIndicatorRecords.mockReturnValue(
      INDICATOR_DATA as ReturnType<typeof adaptIndicatorRecords>,
    );

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { result } = renderHook(() => useIndicators());

    await waitFor(() => expect(result.current.status).not.toBe('loading'));

    expect(result.current.status).toBe('ready');
    expect(result.current.error).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Cenário 4: erro da API em produção (shouldUseFallback = false)
// ---------------------------------------------------------------------------

describe('useIndicators — cenário 4: erro da API em produção', () => {
  it('retorna status error sem usar dados fixos em produção', async () => {
    mockShouldUseFallback.mockReturnValue(false);
    const apiError = new Error('500 Internal Server Error');
    mockListarRegistrosPublicados.mockRejectedValue(apiError);

    const { result } = renderHook(() => useIndicators());

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.visitorFlow).toEqual([]);
    expect(result.current.secondaryCards).toEqual([]);
  });
});
