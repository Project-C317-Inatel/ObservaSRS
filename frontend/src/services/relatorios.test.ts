import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import {
  excluirRelatorio,
  listarRelatorios,
  resolverUrlDownload,
  uploadRelatorio,
} from './relatorios';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('relatorios service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('resolverUrlDownload', () => {
    it('retorna null se a URL for null ou vazia', () => {
      expect(resolverUrlDownload(null)).toBeNull();
      expect(resolverUrlDownload('')).toBeNull();
    });

    it('mantém URLs absolutas inalteradas', () => {
      expect(resolverUrlDownload('https://exemplo.com/relatorio.pdf')).toBe(
        'https://exemplo.com/relatorio.pdf',
      );
      expect(resolverUrlDownload('http://exemplo.com/relatorio.pdf')).toBe(
        'http://exemplo.com/relatorio.pdf',
      );
    });

    it('concatena a URL relativa com VITE_API_URL configurada', () => {
      vi.stubEnv('VITE_API_URL', 'http://api.local:3333');

      expect(resolverUrlDownload('/relatorios/123/download')).toBe(
        'http://api.local:3333/relatorios/123/download',
      );
      expect(resolverUrlDownload('relatorios/123/download')).toBe(
        'http://api.local:3333/relatorios/123/download',
      );
    });
  });

  describe('listarRelatorios', () => {
    it('chama GET /relatorios sem parâmetro quando nenhum tipo é fornecido', async () => {
      const mockResponse = { relatorios: [] };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarRelatorios();

      expect(api.get).toHaveBeenCalledWith('/relatorios');
      expect(resultado).toEqual(mockResponse);
    });

    it('inclui tipo codificado na query string quando fornecido', async () => {
      const mockResponse = {
        relatorios: [
          {
            id: 'rel-1',
            titulo: 'Relatório Trimestral Q1',
            descricao: 'Dados do primeiro trimestre.',
            tipo: 'Trimestral' as const,
            publicadoEm: '2026-04-01',
            arquivoUrl: '/relatorios/rel-1/download',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarRelatorios('Trimestral');

      expect(api.get).toHaveBeenCalledWith('/relatorios?tipo=Trimestral');
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('uploadRelatorio', () => {
    it('chama POST /admin/relatorios com FormData', async () => {
      const formData = new FormData();
      formData.append('titulo', 'Novo Relatório');
      const mockResponse = {
        message: 'Relatório enviado com sucesso.',
        relatorio: {
          id: 'rel-novo',
          titulo: 'Novo Relatório',
          descricao: 'Desc',
          tipo: 'Setorial' as const,
          publicadoEm: '2026-05-01',
          arquivoUrl: '/relatorios/rel-novo/download',
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const resultado = await uploadRelatorio(formData);

      expect(api.post).toHaveBeenCalledWith('/admin/relatorios', formData);
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('excluirRelatorio', () => {
    it('chama DELETE /admin/relatorios/:id', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await excluirRelatorio('rel-1');

      expect(api.delete).toHaveBeenCalledWith('/admin/relatorios/rel-1');
    });
  });

  describe('propagação de erros', () => {
    it('propaga erro rejeitado pela chamada da api', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Falha ao listar relatórios'));

      await expect(listarRelatorios()).rejects.toThrow('Falha ao listar relatórios');
    });
  });
});
