import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/fallback', () => ({
  isMockMode: vi.fn(() => false),
  shouldUseFallback: vi.fn(() => false),
}));

vi.mock('../../services/indicadores', () => ({
  listarDestaquesHome: vi.fn(),
}));

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarDestaquesHome } from '../../services/indicadores';
import { HIGHLIGHT_METRICS } from './data';
import { useHighlightMetrics } from './useHighlightMetrics';

const mockIsMockMode = vi.mocked(isMockMode);
const mockShouldUseFallback = vi.mocked(shouldUseFallback);
const mockListarDestaquesHome = vi.mocked(listarDestaquesHome);

describe('useHighlightMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMockMode.mockReturnValue(false);
    mockShouldUseFallback.mockReturnValue(false);
  });

  describe('cenário 1: sucesso da API', () => {
    it('busca destaques da API e adapta para o formato visual', async () => {
      const destaquesApi = [
        { id: 'hospedagens', valor: 55, rotulo: 'Hospedagens', legenda: '+5 em 2026' },
        { id: 'leitos', valor: 3100, rotulo: 'Leitos ocupados', legenda: 'Média atual' },
      ];
      mockListarDestaquesHome.mockResolvedValueOnce({ destaques: destaquesApi });

      const { result } = renderHook(() => useHighlightMetrics());

      expect(result.current.status).toBe('loading');

      await waitFor(() => expect(result.current.status).toBe('ready'));

      expect(mockListarDestaquesHome).toHaveBeenCalledOnce();
      expect(result.current.metrics).toHaveLength(2);
      expect(result.current.metrics[0]).toMatchObject({
        id: 'hospedagens',
        value: 55,
        label: 'Hospedagens',
        caption: '+5 em 2026',
        iconClass: 'bg-data-sky',
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('cenário 2: flag de mock ativa', () => {
    it('retorna HIGHLIGHT_METRICS sem chamar a API quando isMockMode() é true', async () => {
      mockIsMockMode.mockReturnValue(true);

      const { result } = renderHook(() => useHighlightMetrics());

      await waitFor(() => expect(result.current.status).toBe('ready'));

      expect(mockListarDestaquesHome).not.toHaveBeenCalled();
      expect(result.current.metrics).toBe(HIGHLIGHT_METRICS);
      expect(result.current.error).toBeNull();
    });
  });

  describe('cenário 3: erro da API em desenvolvimento', () => {
    it('aplica fallback para HIGHLIGHT_METRICS com status ready em caso de falha', async () => {
      mockShouldUseFallback.mockReturnValue(true);
      mockListarDestaquesHome.mockRejectedValueOnce(new Error('Erro de conexão'));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const { result } = renderHook(() => useHighlightMetrics());

      await waitFor(() => expect(result.current.status).toBe('ready'));

      expect(result.current.metrics).toBe(HIGHLIGHT_METRICS);
      expect(result.current.error).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('cenário 4: erro da API em produção', () => {
    it('retorna status error sem usar dados fixos em produção', async () => {
      mockShouldUseFallback.mockReturnValue(false);
      mockListarDestaquesHome.mockRejectedValueOnce(new Error('500 Internal Server Error'));

      const { result } = renderHook(() => useHighlightMetrics());

      await waitFor(() => expect(result.current.status).toBe('error'));

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.metrics).toEqual([]);
    });
  });

  describe('comportamento com métricas explícitas', () => {
    it('retorna diretamente as métricas passadas por parâmetro', () => {
      const explicitas = HIGHLIGHT_METRICS.slice(0, 1);
      const { result } = renderHook(() => useHighlightMetrics({ metrics: explicitas }));

      expect(result.current.status).toBe('ready');
      expect(result.current.metrics).toBe(explicitas);
      expect(mockListarDestaquesHome).not.toHaveBeenCalled();
    });
  });
});
