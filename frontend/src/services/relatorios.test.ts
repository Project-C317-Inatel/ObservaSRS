import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import {
  alterarPublicacaoRelatorio,
  criarRelatorio,
  listarRelatorios,
  resolverUrlDownload,
  uploadRelatorio,
} from './relatorios';
import { pagina } from '../test/fixtures';
vi.mock('./api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
describe('PDFs alinhados ao Swagger', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
  });
  it('resolve download relativo e preserva URL absoluta', () => {
    vi.stubEnv('VITE_API_URL', 'http://api.local:3333');
    expect(resolverUrlDownload('/relatorios/id/arquivo')).toBe(
      'http://api.local:3333/relatorios/id/arquivo',
    );
    expect(resolverUrlDownload('https://exemplo.com/a.pdf')).toBe('https://exemplo.com/a.pdf');
    expect(resolverUrlDownload(null)).toBeNull();
  });
  it('consulta enum em maiusculas e paginas', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(pagina('relatorios', []));
    expect(await listarRelatorios('TRIMESTRAL')).toEqual({ relatorios: [] });
    expect(api.get).toHaveBeenCalledWith('/relatorios?tipo=TRIMESTRAL&pagina=1&limite=100');
  });
  it('cadastra JSON antes de enviar somente o PDF', async () => {
    const dados = {
      titulo: 'Relatorio exemplo',
      tipo: 'ANUAL' as const,
      periodoReferencia: '2026',
    };
    await criarRelatorio(dados);
    const arquivo = new File(['%PDF-'], 'exemplo.pdf', { type: 'application/pdf' });
    await uploadRelatorio('id', arquivo);
    expect(api.post).toHaveBeenNthCalledWith(1, '/admin/relatorios', dados);
    const [path, body] = vi.mocked(api.post).mock.calls[1]!;
    expect(path).toBe('/admin/relatorios/id/arquivo');
    expect(body).toBeInstanceOf(FormData);
    expect([...(body as FormData).keys()]).toEqual(['arquivo']);
    expect((body as FormData).get('arquivo')).toBe(arquivo);
  });
  it('publica e despublica sem excluir o historico', async () => {
    await alterarPublicacaoRelatorio('id', true);
    await alterarPublicacaoRelatorio('id', false);
    expect(api.patch).toHaveBeenNthCalledWith(1, '/admin/relatorios/id/publicacao', {
      publicado: true,
    });
    expect(api.patch).toHaveBeenNthCalledWith(2, '/admin/relatorios/id/publicacao', {
      publicado: false,
    });
  });
});
