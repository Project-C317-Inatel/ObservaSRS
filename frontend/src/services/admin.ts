import { api } from './api';
import type { EvaluationResponse, ListAccessRequestsResponse, RequestStatus } from '../types';

export function listAccessRequests(status?: RequestStatus): Promise<ListAccessRequestsResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return api.get<ListAccessRequestsResponse>(`/admin/solicitacoes${query}`);
}

export function approveAccessRequest(id: string): Promise<EvaluationResponse> {
  return api.patch<EvaluationResponse>(`/admin/solicitacoes/${id}/aprovar`);
}

export function rejectAccessRequest(id: string): Promise<EvaluationResponse> {
  return api.patch<EvaluationResponse>(`/admin/solicitacoes/${id}/rejeitar`);
}
