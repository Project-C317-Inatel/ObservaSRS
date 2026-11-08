import { api } from './api';
import type {
  ColetaAutonomaRequest,
  ColetaAutonomaResponse,
  ListColetasResponse,
  RequestStatus,
  ColetaResponse,
} from '../types';

export function enviarColeta(data: ColetaAutonomaRequest): Promise<ColetaAutonomaResponse> {
  return api.post<ColetaAutonomaResponse>('/api/coletas', data);
}

export function listarColetasAdmin(
  status?: RequestStatus,
  filtros: {
    pagina?: number;
    limite?: number;
    estabelecimentoId?: string;
    periodoReferencia?: string;
    publicado?: boolean;
  } = {},
): Promise<ListColetasResponse> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  for (const [campo, valor] of Object.entries(filtros)) {
    if (valor !== undefined) params.set(campo, String(valor));
  }
  const query = params.size ? `?${params}` : '';
  return api.get<ListColetasResponse>(`/admin/coletas${query}`);
}

export function aprovarColeta(id: string): Promise<ColetaResponse> {
  return api.patch<ColetaResponse>(`/admin/coletas/${id}/aprovar`);
}

export function rejeitarColeta(id: string): Promise<ColetaResponse> {
  return api.patch<ColetaResponse>(`/admin/coletas/${id}/rejeitar`);
}

export function alterarPublicacaoColeta(id: string, publicado: boolean): Promise<ColetaResponse> {
  return api.patch<ColetaResponse>(`/admin/coletas/${id}/publicacao`, { publicado });
}
