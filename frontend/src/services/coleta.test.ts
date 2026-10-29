import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import { aprovarColeta, enviarColeta, listarColetasAdmin, rejeitarColeta } from './coleta';
import type { ColetaAutonomaRequest, ColetaAutonomaResponse } from '../types';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
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

describe('coleta service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enviarColeta', () => {
    it('deve chamar api.post com /coletas e body correto', async () => {
      vi.mocked(api.post).mockResolvedValue(mockResponse);
      const result = await enviarColeta(mockData);
      expect(api.post).toHaveBeenCalledWith('/coletas', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar erro se api.post rejeitar', async () => {
      const error = new Error('Network error');
      vi.mocked(api.post).mockRejectedValue(error);
      await expect(enviarColeta(mockData)).rejects.toThrow('Network error');
    });
  });

  describe('listarColetasAdmin', () => {
    it('deve chamar GET /admin/coletas sem query params quando nenhum status for informado', async () => {
      const mockListResponse = { coletas: [] };
      vi.mocked(api.get).mockResolvedValueOnce(mockListResponse);

      const result = await listarColetasAdmin();

      expect(api.get).toHaveBeenCalledWith('/admin/coletas');
      expect(result).toEqual(mockListResponse);
    });

    it('deve incluir o status na query string quando informado', async () => {
      const mockListResponse = {
        coletas: [
          {
            id: 'col-1',
            nomeEstabelecimento: 'Pousada Vale Encantado',
            cnpjCadastur: '12.345.678/0001-90',
            periodoReferencia: '2026-10',
            leitosOcupados: 25,
            origemVisitantes: 'sudeste',
            status: 'PENDENTE' as const,
            criadoEm: '2026-10-28T18:00:00.000Z',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockListResponse);

      const result = await listarColetasAdmin('PENDENTE');

      expect(api.get).toHaveBeenCalledWith('/admin/coletas?status=PENDENTE');
      expect(result).toEqual(mockListResponse);
    });
  });

  describe('aprovarColeta', () => {
    it('deve chamar PATCH /admin/coletas/:id/aprovar', async () => {
      const mockApproveResponse = { message: 'Coleta aprovada com sucesso.' };
      vi.mocked(api.patch).mockResolvedValueOnce(mockApproveResponse);

      const result = await aprovarColeta('col-1');

      expect(api.patch).toHaveBeenCalledWith('/admin/coletas/col-1/aprovar');
      expect(result).toEqual(mockApproveResponse);
    });
  });

  describe('rejeitarColeta', () => {
    it('deve chamar PATCH /admin/coletas/:id/rejeitar com motivo quando informado', async () => {
      const mockRejectResponse = { message: 'Coleta rejeitada.' };
      vi.mocked(api.patch).mockResolvedValueOnce(mockRejectResponse);

      const result = await rejeitarColeta('col-1', 'CNPJ não encontrado no Cadastur.');

      expect(api.patch).toHaveBeenCalledWith('/admin/coletas/col-1/rejeitar', {
        motivo: 'CNPJ não encontrado no Cadastur.',
      });
      expect(result).toEqual(mockRejectResponse);
    });

    it('deve chamar PATCH /admin/coletas/:id/rejeitar sem body quando motivo não for fornecido', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ message: 'Coleta rejeitada.' });

      await rejeitarColeta('col-1');

      expect(api.patch).toHaveBeenCalledWith('/admin/coletas/col-1/rejeitar', undefined);
    });
  });
});
