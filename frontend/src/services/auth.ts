import { api } from './api';
import type { LoginRequest, LoginResponse } from '../types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<unknown>('/auth/login', data);

  if (!isLoginResponse(response)) {
    throw new Error('A resposta da API está inválida.');
  }

  return response;
}

export function getCurrentUser(): Promise<LoginResponse> {
  return api.get<LoginResponse>('/auth/me');
}

export function logout(): Promise<void> {
  return api.post<void>('/auth/logout');
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (typeof value !== 'object' || value === null || !('usuario' in value)) {
    return false;
  }

  const user = value.usuario;
  return typeof user === 'object' && user !== null && 'id' in user;
}
