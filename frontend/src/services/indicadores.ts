import { api } from './api';
import type {
  ListHighlightMetricsResponse,
  ListIndicadoresResponse,
  ListRegistrosResponse,
  ListSetoresResponse,
} from '../types';

export interface FiltrosRegistrosPublicados {
  indicadorId?: string;
  setorId?: string;
  ano?: number;
  periodoInicio?: string;
  periodoFim?: string;
}

export function listarSetores(): Promise<ListSetoresResponse> {
  return api.get<ListSetoresResponse>('/setores');
}

export function listarIndicadores(setorId?: string): Promise<ListIndicadoresResponse> {
  const query = setorId ? `?setorId=${encodeURIComponent(setorId)}` : '';
  return api.get<ListIndicadoresResponse>(`/indicadores${query}`);
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
  if (filtros?.ano !== undefined) {
    params.set('ano', String(filtros.ano));
  }
  if (filtros?.periodoInicio) {
    params.set('periodoInicio', filtros.periodoInicio);
  }
  if (filtros?.periodoFim) {
    params.set('periodoFim', filtros.periodoFim);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get<ListRegistrosResponse>(`/indicadores/dados${query}`);
}

export function listarDestaquesHome(): Promise<ListHighlightMetricsResponse> {
  return api.get<ListHighlightMetricsResponse>('/indicadores/destaques');
}
