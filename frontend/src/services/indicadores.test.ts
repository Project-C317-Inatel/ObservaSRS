import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import {
  listarDestaquesHome,
  listarIndicadores,
  listarRegistrosPublicados,
  listarSetores,
} from './indicadores';
import { pagina, registroPublico } from '../test/fixtures';
vi.mock('./api', async (original) => ({
  ...(await original<typeof import('./api')>()),
  api: { get: vi.fn() },
}));
describe('servicos de indicadores alinhados ao Swagger', () => {
  beforeEach(() => vi.resetAllMocks());
  it('consulta setores e indicadores paginados', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(pagina('setores', []))
      .mockResolvedValueOnce(pagina('indicadores', []));
    expect(await listarSetores()).toEqual({ setores: [] });
    expect(await listarIndicadores('setor-1')).toEqual({ indicadores: [] });
    expect(api.get).toHaveBeenNthCalledWith(1, '/setores?pagina=1&limite=100');
    expect(api.get).toHaveBeenNthCalledWith(2, '/indicadores?setorId=setor-1&pagina=1&limite=100');
  });
  it('envia somente filtros suportados pelo backend', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(pagina('registros', [registroPublico()]));
    expect(
      (
        await listarRegistrosPublicados({
          setorId: 'setor-1',
          periodoInicio: '2026-01-01',
          periodoFim: '2026-12-31',
        })
      ).registros[0]?.indicador.nome,
    ).toBe('Visitantes');
    expect(api.get).toHaveBeenCalledWith(
      '/registros-indicadores?setorId=setor-1&periodoInicio=2026-01-01&periodoFim=2026-12-31&pagina=1&limite=100',
    );
  });
  it('percorre todas as paginas para nao truncar graficos', async () => {
    const cem = Array.from({ length: 100 }, (_, i) =>
      registroPublico('Visitantes', '1', { id: String(i) }),
    );
    vi.mocked(api.get)
      .mockResolvedValueOnce(pagina('registros', cem, 1, 101))
      .mockResolvedValueOnce(pagina('registros', [registroPublico()], 2, 101));
    expect((await listarRegistrosPublicados()).registros).toHaveLength(101);
    expect(api.get).toHaveBeenNthCalledWith(2, '/registros-indicadores?pagina=2&limite=100');
  });
  it('rejeita paginas incompletas', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(pagina('registros', [registroPublico()], 1, 101));
    await expect(listarRegistrosPublicados()).rejects.toThrow(/inválida/);
  });
  it('monta destaques com o ultimo registro publicado sem rota ficticia', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(
      pagina('registros', [
        registroPublico('Leitos ocupados', '25.00'),
        registroPublico('Leitos ocupados', '20.00', { id: 'antigo', periodo: '2025-01-01' }),
      ]),
    );
    expect(await listarDestaquesHome()).toEqual({
      destaques: [
        { id: 'leitos', valor: 25, rotulo: 'Leitos ocupados', legenda: '2026-01-01 · Hotelaria' },
      ],
    });
    expect(api.get).toHaveBeenCalledWith('/registros-indicadores?pagina=1&limite=100');
  });
  it('nao escolhe fonte arbitraria para um destaque ambiguo', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(
      pagina('registros', [
        registroPublico('Leitos ocupados'),
        registroPublico('Leitos ocupados', '2', { id: 'outro', fonteId: 'fonte-2' }),
      ]),
    );
    await expect(listarDestaquesHome()).rejects.toThrow(/mais de um registro/);
  });
  it('propaga erros da API', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Falha de rede'));
    await expect(listarSetores()).rejects.toThrow('Falha de rede');
  });
});
