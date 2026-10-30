import { api } from './api';
import type {
  ColetaAutonomaRequest,
  ColetaAutonomaResponse,
  ListColetasResponse,
  RequestStatus,
} from '../types';

export function enviarColeta(data: ColetaAutonomaRequest): Promise<ColetaAutonomaResponse> {
  return api.post<ColetaAutonomaResponse>('/coletas', data);
}

export function listarColetasAdmin(status?: RequestStatus): Promise<ListColetasResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return api.get<ListColetasResponse>(`/admin/coletas${query}`);
}

export function aprovarColeta(id: string): Promise<{ message: string }> {
  return api.patch<{ message: string }>(`/admin/coletas/${id}/aprovar`);
}

export function rejeitarColeta(id: string, motivo?: string): Promise<{ message: string }> {
  const body = motivo ? { motivo } : undefined;
  return api.patch<{ message: string }>(`/admin/coletas/${id}/rejeitar`, body);
}
