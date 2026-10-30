import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../services/fallback', () => ({
  isMockMode: vi.fn(() => false),
  shouldUseFallback: vi.fn(() => false),
}));

vi.mock('../../services/relatorios', () => ({
  listarRelatorios: vi.fn(),
}));

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarRelatorios } from '../../services/relatorios';
import { PUBLIC_REPORTS } from './data';
import { useReports } from './useReports';

const mockIsMockMode = vi.mocked(isMockMode);
const mockShouldUseFallback = vi.mocked(shouldUseFallback);
const mockListarRelatorios = vi.mocked(listarRelatorios);

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

describe('useReports — cenário 1: sucesso da API', () => {
  it('busca relatórios da API e retorna status ready', async () => {
    const relatoriosApi = [
      {
        id: 'rel-1',
        titulo: 'Relatório Q1',
        descricao: 'Primeiro trimestre',
        tipo: 'Trimestral' as const,
        publicadoEm: '2026-03-31',
        arquivoUrl: '/relatorios/rel-1/download',
      },
    ];
    mockListarRelatorios.mockResolvedValue({ relatorios: relatoriosApi });

    const { result } = renderHook(() => useReports());

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(mockListarRelatorios).toHaveBeenCalledOnce();
    expect(result.current.reports).toEqual(relatoriosApi);
    expect(result.current.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cenário 2: flag de mock ativa
// ---------------------------------------------------------------------------

describe('useReports — cenário 2: flag de mock ativa', () => {
  it('retorna PUBLIC_REPORTS sem chamar a API quando isMockMode() é true', async () => {
    mockIsMockMode.mockReturnValue(true);

    const { result } = renderHook(() => useReports());

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(mockListarRelatorios).not.toHaveBeenCalled();
    expect(result.current.reports).toBe(PUBLIC_REPORTS);
    expect(result.current.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cenário 3: erro da API em desenvolvimento (shouldUseFallback = true)
// ---------------------------------------------------------------------------

describe('useReports — cenário 3: erro da API em desenvolvimento', () => {
  it('aplica fallback para PUBLIC_REPORTS com status ready em caso de falha', async () => {
    mockShouldUseFallback.mockReturnValue(true);
    mockListarRelatorios.mockRejectedValue(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { result } = renderHook(() => useReports());

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current.reports).toBe(PUBLIC_REPORTS);
    expect(result.current.error).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Cenário 4: erro da API em produção (shouldUseFallback = false)
// ---------------------------------------------------------------------------

describe('useReports — cenário 4: erro da API em produção', () => {
  it('retorna status error sem usar dados fixos em produção', async () => {
    mockShouldUseFallback.mockReturnValue(false);
    mockListarRelatorios.mockRejectedValue(new Error('500 Internal Server Error'));

    const { result } = renderHook(() => useReports());

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.reports).toEqual([]);
  });
});
