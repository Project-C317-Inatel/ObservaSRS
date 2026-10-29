import { api } from './api';
import type {
  CreatePitItemRequest,
  ListPitResponse,
  PitCategory,
  PitItemResponse,
  UpdatePitItemRequest,
} from '../types';

export function listarItensPit(categoria?: PitCategory): Promise<ListPitResponse> {
  const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : '';
  return api.get<ListPitResponse>(`/pit${query}`);
}

export function criarItemPit(dados: CreatePitItemRequest): Promise<PitItemResponse> {
  return api.post<PitItemResponse>('/admin/pit', dados);
}

export function atualizarItemPit(
  id: string,
  dados: UpdatePitItemRequest,
): Promise<PitItemResponse> {
  return api.patch<PitItemResponse>(`/admin/pit/${id}`, dados);
}

export function excluirItemPit(id: string): Promise<void> {
  return api.delete<void>(`/admin/pit/${id}`);
}
