import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useIndicators } from './useIndicators';

describe('useIndicators', () => {
  it('calcula a visão inicial com os dados demonstrativos', () => {
    const { result } = renderHook(() => useIndicators());

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
    const { result } = renderHook(() => useIndicators());

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
    const { result } = renderHook(() => useIndicators());

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
    const { result } = renderHook(() => useIndicators());

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
