import type { Paginacao } from '../types';
import { api, InvalidApiResponseError } from './api';

/** Reune as paginas para telas cujos filtros e graficos trabalham sobre a colecao completa. */
export async function listarTodasPaginas<K extends string, T>(
  path: string,
  campo: K,
): Promise<Record<K, T[]>> {
  const itens: T[] = [];
  const ids = new Set<string>();
  let pagina = 1;
  let totalEsperado: number | undefined;
  for (;;) {
    const params = new URLSearchParams(path.split('?')[1]);
    params.set('pagina', String(pagina));
    params.set('limite', '100');
    const resposta = await api.get<Record<K, T[]> & { paginacao: Paginacao }>(
      `${path.split('?')[0]}?${params}`,
    );
    const dados = resposta?.[campo];
    const meta = resposta?.paginacao;
    if (
      !Array.isArray(dados) ||
      !meta ||
      meta.pagina !== pagina ||
      meta.limite !== 100 ||
      !Number.isInteger(meta.total) ||
      meta.total < 0 ||
      meta.totalPaginas !== Math.ceil(meta.total / 100) ||
      (totalEsperado !== undefined && meta.total !== totalEsperado) ||
      dados.length !== Math.min(100, Math.max(0, meta.total - (pagina - 1) * 100))
    ) {
      throw new InvalidApiResponseError();
    }
    for (const item of dados) {
      const id = (item as { id?: unknown }).id;
      if (typeof id !== 'string' || ids.has(id)) throw new InvalidApiResponseError();
      ids.add(id);
    }
    itens.push(...dados);
    totalEsperado = meta.total;
    if (pagina >= meta.totalPaginas) break;
    pagina++;
  }
  return { [campo]: itens } as Record<K, T[]>;
}
