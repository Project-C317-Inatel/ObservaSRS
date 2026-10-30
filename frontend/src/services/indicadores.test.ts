import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import {
  listarDestaquesHome,
  listarIndicadores,
  listarRegistrosPublicados,
  listarSetores,
} from './indicadores';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('indicadores service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarSetores', () => {
    it('chama GET /setores e retorna a lista de setores ativos', async () => {
      const mockResponse = {
        setores: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            nome: 'Hotelaria',
            descricao: 'Meios de hospedagem de Santa Rita do Sapucaí.',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarSetores();

      expect(api.get).toHaveBeenCalledWith('/setores');
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('listarIndicadores', () => {
    it('chama GET /indicadores sem query params quando setorId não é informado', async () => {
      const mockResponse = { indicadores: [] };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarIndicadores();

      expect(api.get).toHaveBeenCalledWith('/indicadores');
      expect(resultado).toEqual(mockResponse);
    });

    it('envia setorId codificado na query string quando fornecido', async () => {
      const mockResponse = {
        indicadores: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            nome: 'Taxa de ocupação',
            codigo: 'taxa_ocupacao',
            unidade: '%',
            descricao: 'Percentual de ocupação hoteleira.',
            setor: {
              id: '11111111-1111-4111-8111-111111111111',
              nome: 'Hotelaria',
            },
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarIndicadores('11111111-1111-4111-8111-111111111111');

      expect(api.get).toHaveBeenCalledWith(
        '/indicadores?setorId=11111111-1111-4111-8111-111111111111',
      );
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('listarRegistrosPublicados', () => {
    it('chama GET /indicadores/dados sem query params quando filtros não são passados', async () => {
      const mockResponse = { registros: [] };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarRegistrosPublicados();

      expect(api.get).toHaveBeenCalledWith('/indicadores/dados');
      expect(resultado).toEqual(mockResponse);
    });

    it('formata os parâmetros de filtro corretamente na query string', async () => {
      const mockResponse = {
        registros: [
          {
            id: '44444444-4444-4444-8444-444444444444',
            indicadorId: '22222222-2222-4222-8222-222222222222',
            indicadorNome: 'Taxa de ocupação',
            indicadorCodigo: 'taxa_ocupacao',
            unidade: '%',
            setorNome: 'Hotelaria',
            periodo: '2026-02-01',
            valor: '78.00',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarRegistrosPublicados({
        indicadorId: '22222222-2222-4222-8222-222222222222',
        setorId: '11111111-1111-4111-8111-111111111111',
        ano: 2026,
        periodoInicio: '2026-01-01',
        periodoFim: '2026-12-31',
      });

      expect(api.get).toHaveBeenCalledWith(
        '/indicadores/dados?indicadorId=22222222-2222-4222-8222-222222222222&setorId=11111111-1111-4111-8111-111111111111&ano=2026&periodoInicio=2026-01-01&periodoFim=2026-12-31',
      );
      expect(resultado).toEqual(mockResponse);
    });

    it('lida com filtros parciais sem adicionar parâmetros indefinidos', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ registros: [] });

      await listarRegistrosPublicados({ ano: 2026, setorId: 'setor-abc' });

      expect(api.get).toHaveBeenCalledWith('/indicadores/dados?setorId=setor-abc&ano=2026');
    });
  });

  describe('listarDestaquesHome', () => {
    it('chama GET /indicadores/destaques e retorna as métricas em destaque', async () => {
      const mockResponse = {
        destaques: [
          { id: 'hospedagens', valor: 42, rotulo: 'Hospedagens', legenda: '+3 desde 2024' },
          { id: 'leitos', valor: 2730, rotulo: 'Leitos ocupados', legenda: 'Média julho/2025' },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarDestaquesHome();

      expect(api.get).toHaveBeenCalledWith('/indicadores/destaques');
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('propagação de erros', () => {
    it('propaga erro rejeitado pela chamada da api', async () => {
      const erroEsperado = new Error('Falha de rede');
      vi.mocked(api.get).mockRejectedValueOnce(erroEsperado);

      await expect(listarSetores()).rejects.toThrow('Falha de rede');
    });
  });
});
