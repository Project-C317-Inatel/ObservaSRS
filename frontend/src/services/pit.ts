import { api } from './api';
import { listarTodasPaginas } from './paginacao';
import type {
  CreatePitItemRequest,
  ListPitResponse,
  PitCategory,
  PitItemResponse,
  PitItem,
  UpdatePitItemRequest,
} from '../types';

export function listarItensPit(categoria?: PitCategory): Promise<ListPitResponse> {
  const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : '';
  return listarTodasPaginas<'itens', PitItem>(`/itens-pit${query}`, 'itens');
}

export function criarItemPit(dados: CreatePitItemRequest): Promise<PitItemResponse> {
  return api.post<PitItemResponse>('/admin/itens-pit', dados);
}

export function atualizarItemPit(
  id: string,
  dados: UpdatePitItemRequest,
): Promise<PitItemResponse> {
  return api.patch<PitItemResponse>(`/admin/itens-pit/${id}`, dados);
}

export function alterarAtivacaoItemPit(id: string, ativo: boolean): Promise<PitItemResponse> {
  return atualizarItemPit(id, { ativo });
}
