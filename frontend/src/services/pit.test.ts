import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { alterarAtivacaoItemPit, atualizarItemPit, criarItemPit, listarItensPit } from './pit';
import { pagina } from '../test/fixtures';
vi.mock('./api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
describe('PIT alinhado ao Swagger', () => {
  beforeEach(() => vi.resetAllMocks());
  it('lista itens-pit com categoria codificada', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(pagina('itens', []));
    expect(await listarItensPit('Museu / Cultura')).toEqual({ itens: [] });
    expect(api.get).toHaveBeenCalledWith(
      '/itens-pit?categoria=Museu+%2F+Cultura&pagina=1&limite=100',
    );
  });
  it('cria e edita nas rotas reais', async () => {
    const dados = { nome: 'Museu exemplo', categoria: 'Cultura', localizacao: 'Centro' };
    await criarItemPit(dados);
    await atualizarItemPit('id', { descricao: null });
    expect(api.post).toHaveBeenCalledWith('/admin/itens-pit', dados);
    expect(api.patch).toHaveBeenCalledWith('/admin/itens-pit/id', { descricao: null });
  });
  it('desativa e reativa sem DELETE inexistente', async () => {
    await alterarAtivacaoItemPit('id', false);
    await alterarAtivacaoItemPit('id', true);
    expect(api.patch).toHaveBeenNthCalledWith(1, '/admin/itens-pit/id', { ativo: false });
    expect(api.patch).toHaveBeenNthCalledWith(2, '/admin/itens-pit/id', { ativo: true });
  });
});
