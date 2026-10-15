import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';
import { enviarColeta } from './coleta';
import type { ColetaAutonomaRequest, ColetaAutonomaResponse } from '../types';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockData: ColetaAutonomaRequest = {
  nomeEstabelecimento: 'Hotel Teste',
  cnpjCadastur: '12.345.678/0001-95',
  periodoReferencia: '2026-10',
  leitosOcupados: 42,
  origemVisitantes: 'sudeste',
};

const mockResponse: ColetaAutonomaResponse = {
  message: 'Coleta registrada com sucesso.',
  coleta: { id: 'abc-123', ...mockData },
};

describe('enviarColeta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar api.post com o path e body corretos', async () => {
    vi.mocked(api.post).mockResolvedValue(mockResponse);
    await enviarColeta(mockData);
    expect(api.post).toHaveBeenCalledWith('/api/coletas', mockData);
  });

  it('deve retornar a response da API', async () => {
    vi.mocked(api.post).mockResolvedValue(mockResponse);
    const result = await enviarColeta(mockData);
    expect(result).toEqual(mockResponse);
  });

  it('deve propagar erro se api.post rejeitar', async () => {
    const error = new Error('Network error');
    vi.mocked(api.post).mockRejectedValue(error);
    await expect(enviarColeta(mockData)).rejects.toThrow('Network error');
  });
});
