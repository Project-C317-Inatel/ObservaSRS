import { InvalidApiResponseError } from './api';
import { listarTodasPaginas } from './paginacao';
import { codigoVisual } from '../shared/metricas';
import type {
  ListHighlightMetricsResponse,
  ListIndicadoresResponse,
  ListRegistrosResponse,
  ListSetoresResponse,
  Indicador,
  RegistroIndicador,
  Setor,
} from '../types';

export interface FiltrosRegistrosPublicados {
  indicadorId?: string;
  fonteId?: string;
  setorId?: string;
  periodoInicio?: string;
  periodoFim?: string;
}

export function listarSetores(): Promise<ListSetoresResponse> {
  return listarTodasPaginas<'setores', Setor>('/setores', 'setores');
}

export function listarIndicadores(setorId?: string): Promise<ListIndicadoresResponse> {
  const query = setorId ? `?setorId=${encodeURIComponent(setorId)}` : '';
  return listarTodasPaginas<'indicadores', Indicador>(`/indicadores${query}`, 'indicadores');
}

export function listarRegistrosPublicados(
  filtros?: FiltrosRegistrosPublicados,
): Promise<ListRegistrosResponse> {
  const params = new URLSearchParams();

  if (filtros?.indicadorId) {
    params.set('indicadorId', filtros.indicadorId);
  }
  if (filtros?.setorId) {
    params.set('setorId', filtros.setorId);
  }
  if (filtros?.fonteId) params.set('fonteId', filtros.fonteId);
  if (filtros?.periodoInicio) {
    params.set('periodoInicio', filtros.periodoInicio);
  }
  if (filtros?.periodoFim) {
    params.set('periodoFim', filtros.periodoFim);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  return listarTodasPaginas<'registros', RegistroIndicador>(
    `/registros-indicadores${query}`,
    'registros',
  );
}

export async function listarDestaquesHome(): Promise<ListHighlightMetricsResponse> {
  const { registros } = await listarRegistrosPublicados();
  const rotulos: Record<string, string> = {
    hospedagens: 'Hospedagens',
    leitos: 'Leitos ocupados',
    empresas: 'Empresas cadastradas',
    empregos: 'Empregos gerados',
  };
  const destaques = Object.entries(rotulos).flatMap(([id, rotulo]) => {
    const candidatos = registros.filter((r) => codigoVisual(r.indicador.nome) === id);
    const periodo = candidatos
      .map((r) => r.periodo)
      .sort()
      .at(-1);
    const atuais = candidatos.filter((r) => r.periodo === periodo);
    if (atuais.length === 0) return [];
    if (atuais.length > 1)
      throw new Error(
        `Ha mais de um registro publicado para ${rotulo} no periodo mais recente. Defina a fonte ou consolidacao antes de exibir o destaque.`,
      );
    const atual = atuais[0]!;
    const valor = Number(atual.valor);
    if (!Number.isFinite(valor)) throw new InvalidApiResponseError();
    return [{ id, valor, rotulo, legenda: `${atual.periodo} · ${atual.indicador.setor.nome}` }];
  });
  return { destaques };
}
