import type { RegistroIndicador } from '../types';

export function registroPublico(
  nome = 'Visitantes',
  valor = '10.00',
  overrides: Partial<RegistroIndicador> = {},
): RegistroIndicador {
  return {
    id: `registro-${nome}`,
    indicadorId: `indicador-${nome}`,
    fonteId: 'fonte-1',
    periodo: '2026-01-01',
    valor,
    indicador: {
      id: `indicador-${nome}`,
      nome,
      unidade: 'unidades',
      descricao: null,
      setorId: 'setor-1',
      setor: { id: 'setor-1', nome: 'Hotelaria', descricao: null },
    },
    fonte: {
      id: 'fonte-1',
      nome: 'Fonte exemplo',
      tipo: 'Pesquisa',
      descricao: null,
      referencia: null,
    },
    ...overrides,
  };
}
export function pagina<K extends string, T>(
  campo: K,
  itens: T[],
  numero = 1,
  total = itens.length,
) {
  return {
    [campo]: itens,
    paginacao: { pagina: numero, limite: 100, total, totalPaginas: Math.ceil(total / 100) },
  };
}
