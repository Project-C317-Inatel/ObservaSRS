import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import { atualizarItemPit, criarItemPit, excluirItemPit, listarItensPit } from './pit';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('pit service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarItensPit', () => {
    it('chama GET /pit sem query params quando nenhuma categoria é informada', async () => {
      const mockResponse = { itens: [] };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarItensPit();

      expect(api.get).toHaveBeenCalledWith('/pit');
      expect(resultado).toEqual(mockResponse);
    });

    it('formata categoria codificada na query string quando informada', async () => {
      const mockResponse = {
        itens: [
          {
            id: 'pit-1',
            nome: 'Mercado Municipal',
            categoria: 'Gastronomia' as const,
            descricao: 'Produtos locais e queijos artesanais.',
            imagemUrl: null,
            localizacao: 'Centro',
            atualizadoEm: '2026-03-01',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarItensPit('Gastronomia');

      expect(api.get).toHaveBeenCalledWith('/pit?categoria=Gastronomia');
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('criarItemPit', () => {
    it('chama POST /admin/pit com payload JSON', async () => {
      const payload = {
        nome: 'Mirante da Serra',
        categoria: 'Atração Natural' as const,
        descricao: 'Vista panorâmica do vale.',
        localizacao: 'Zona Rural',
        imagemUrl: null,
      };
      const mockResponse = {
        message: 'Item do PIT cadastrado com sucesso.',
        item: {
          id: 'pit-new',
          ...payload,
          atualizadoEm: '2026-04-01',
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const resultado = await criarItemPit(payload);

      expect(api.post).toHaveBeenCalledWith('/admin/pit', payload);
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('atualizarItemPit', () => {
    it('chama PATCH /admin/pit/:id com os campos a atualizar', async () => {
      const payload = { descricao: 'Nova descrição atualizada.' };
      const mockResponse = {
        message: 'Item do PIT atualizado.',
        item: {
          id: 'pit-1',
          nome: 'Mercado Municipal',
          categoria: 'Gastronomia' as const,
          descricao: 'Nova descrição atualizada.',
          imagemUrl: null,
          localizacao: 'Centro',
          atualizadoEm: '2026-04-02',
        },
      };
      vi.mocked(api.patch).mockResolvedValueOnce(mockResponse);

      const resultado = await atualizarItemPit('pit-1', payload);

      expect(api.patch).toHaveBeenCalledWith('/admin/pit/pit-1', payload);
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('excluirItemPit', () => {
    it('chama DELETE /admin/pit/:id', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await excluirItemPit('pit-1');

      expect(api.delete).toHaveBeenCalledWith('/admin/pit/pit-1');
    });
  });

  describe('propagação de erros', () => {
    it('propaga erro rejeitado pela chamada da api', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Falha de rede'));

      await expect(listarItensPit()).rejects.toThrow('Falha de rede');
    });
  });
});
