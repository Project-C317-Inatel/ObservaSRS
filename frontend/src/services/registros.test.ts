import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import {
  alterarPublicacaoRegistro,
  atualizarRegistroIndicador,
  criarRegistroIndicador,
  listarRegistrosAdmin,
} from './registros';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('registros service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarRegistrosAdmin', () => {
    it('chama GET /admin/registros-indicadores sem query params quando nenhum filtro é fornecido', async () => {
      const mockResponse = { registros: [] };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarRegistrosAdmin();

      expect(api.get).toHaveBeenCalledWith('/admin/registros-indicadores');
      expect(resultado).toEqual(mockResponse);
    });

    it('formata os parâmetros de busca corretamente na query string', async () => {
      const mockResponse = {
        registros: [
          {
            id: 'reg-1',
            indicadorId: 'ind-1',
            fonteId: 'fonte-1',
            periodo: '2026-03-01',
            valor: '150.00',
            publicado: true,
            observacao: 'Dado consolidado',
            criadoEm: '2026-03-02T10:00:00.000Z',
            atualizadoEm: '2026-03-02T10:00:00.000Z',
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const resultado = await listarRegistrosAdmin({
        indicadorId: 'ind-1',
        fonteId: 'fonte-1',
        setorId: 'setor-1',
        publicado: true,
        periodoInicio: '2026-01-01',
        periodoFim: '2026-12-31',
      });

      expect(api.get).toHaveBeenCalledWith(
        '/admin/registros-indicadores?indicadorId=ind-1&fonteId=fonte-1&setorId=setor-1&publicado=true&periodoInicio=2026-01-01&periodoFim=2026-12-31',
      );
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('criarRegistroIndicador', () => {
    it('chama POST /admin/registros-indicadores com payload serializado', async () => {
      const payload = {
        indicadorId: 'ind-1',
        fonteId: 'fonte-1',
        periodo: '2026-05-01',
        valor: '450.00',
        publicado: false,
        observacao: 'Prévia',
      };
      const mockResponse = {
        message: 'Registro de indicador cadastrado com sucesso.',
        registro: {
          id: 'reg-new',
          ...payload,
          criadoEm: '2026-05-02T10:00:00.000Z',
          atualizadoEm: '2026-05-02T10:00:00.000Z',
        },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const resultado = await criarRegistroIndicador(payload);

      expect(api.post).toHaveBeenCalledWith('/admin/registros-indicadores', payload);
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('atualizarRegistroIndicador', () => {
    it('chama PATCH /admin/registros-indicadores/:id com os campos a atualizar', async () => {
      const payload = { valor: '520.00', observacao: 'Retificado' };
      const mockResponse = {
        message: 'Registro atualizado.',
        registro: {
          id: 'reg-1',
          indicadorId: 'ind-1',
          fonteId: 'fonte-1',
          periodo: '2026-05-01',
          valor: '520.00',
          publicado: false,
          observacao: 'Retificado',
          criadoEm: '2026-05-02T10:00:00.000Z',
          atualizadoEm: '2026-05-03T11:00:00.000Z',
        },
      };
      vi.mocked(api.patch).mockResolvedValueOnce(mockResponse);

      const resultado = await atualizarRegistroIndicador('reg-1', payload);

      expect(api.patch).toHaveBeenCalledWith('/admin/registros-indicadores/reg-1', payload);
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('alterarPublicacaoRegistro', () => {
    it('chama PATCH /admin/registros-indicadores/:id com { publicado: true }', async () => {
      const mockResponse = {
        message: 'Status de publicação alterado.',
        registro: {
          id: 'reg-1',
          indicadorId: 'ind-1',
          fonteId: 'fonte-1',
          periodo: '2026-05-01',
          valor: '520.00',
          publicado: true,
          observacao: null,
          criadoEm: '2026-05-02T10:00:00.000Z',
          atualizadoEm: '2026-05-03T11:00:00.000Z',
        },
      };
      vi.mocked(api.patch).mockResolvedValueOnce(mockResponse);

      const resultado = await alterarPublicacaoRegistro('reg-1', true);

      expect(api.patch).toHaveBeenCalledWith('/admin/registros-indicadores/reg-1/publicacao', {
        publicado: true,
      });
      expect(resultado).toEqual(mockResponse);
    });

    it('chama PATCH /admin/registros-indicadores/:id com { publicado: false }', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({});

      await alterarPublicacaoRegistro('reg-1', false);

      expect(api.patch).toHaveBeenCalledWith('/admin/registros-indicadores/reg-1/publicacao', {
        publicado: false,
      });
    });
  });

  describe('propagação de erros', () => {
    it('propaga erro rejeitado pela chamada da api', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Erro no servidor'));

      await expect(listarRegistrosAdmin()).rejects.toThrow('Erro no servidor');
    });
  });
});
