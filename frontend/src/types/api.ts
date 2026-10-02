export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

export type RequestStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface ApiUser {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  status: RequestStatus;
}

export interface AccessRequest extends ApiUser {
  ativo: boolean;
  avaliadoEm: string | null;
  avaliadoPorId: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LoginResponse {
  usuario: ApiUser;
}

export interface RegisterResponse {
  message: string;
  solicitacao: ApiUser;
}

export interface EvaluationResponse {
  message: string;
  solicitacao: AccessRequest;
}

export interface ListAccessRequestsResponse {
  solicitacoes: AccessRequest[];
}

export interface StatusResponse {
  status: 'positivo';
  servico: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>[];
}
