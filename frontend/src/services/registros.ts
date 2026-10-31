import { api } from './api';
import type {
  CreateRegistroRequest,
  ListRegistrosAdminResponse,
  RegistroResponse,
  UpdateRegistroRequest,
} from '../types';

export interface FiltrosRegistrosAdmin {
  indicadorId?: string;
  fonteId?: string;
  setorId?: string;
  publicado?: boolean;
  periodoInicio?: string;
  periodoFim?: string;
}

export function listarRegistrosAdmin(
  filtros?: FiltrosRegistrosAdmin,
): Promise<ListRegistrosAdminResponse> {
  const params = new URLSearchParams();

  if (filtros?.indicadorId) {
    params.set('indicadorId', filtros.indicadorId);
  }
  if (filtros?.fonteId) {
    params.set('fonteId', filtros.fonteId);
  }
  if (filtros?.setorId) {
    params.set('setorId', filtros.setorId);
  }
  if (filtros?.publicado !== undefined) {
    params.set('publicado', String(filtros.publicado));
  }
  if (filtros?.periodoInicio) {
    params.set('periodoInicio', filtros.periodoInicio);
  }
  if (filtros?.periodoFim) {
    params.set('periodoFim', filtros.periodoFim);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get<ListRegistrosAdminResponse>(`/admin/registros-indicadores${query}`);
}

export function criarRegistroIndicador(dados: CreateRegistroRequest): Promise<RegistroResponse> {
  return api.post<RegistroResponse>('/admin/registros-indicadores', dados);
}

export function atualizarRegistroIndicador(
  id: string,
  dados: UpdateRegistroRequest,
): Promise<RegistroResponse> {
  return api.patch<RegistroResponse>(`/admin/registros-indicadores/${id}`, dados);
}

export function alterarPublicacaoRegistro(
  id: string,
  publicado: boolean,
): Promise<RegistroResponse> {
  return api.patch<RegistroResponse>(`/admin/registros-indicadores/${id}/publicacao`, {
    publicado,
  });
}
