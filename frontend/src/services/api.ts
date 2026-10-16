import type { ApiError } from '../types';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly details: Record<string, unknown>[] | undefined;

  constructor(status: number, apiError: ApiError | undefined) {
    super(apiError?.message ?? getStatusMessage(status));
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = apiError?.error ?? null;
    this.details = apiError?.details;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    this.name = 'NetworkError';
  }
}

export class InvalidApiResponseError extends Error {
  constructor() {
    super('A resposta do servidor está inválida.');
    this.name = 'InvalidApiResponseError';
  }
}

function getStatusMessage(status: number): string {
  if (status === 401) {
    return 'Sua sessão expirou. Faça login novamente.';
  }

  if (status === 403) {
    return 'Você não possui permissão para realizar esta ação.';
  }

  if (status === 404) {
    return 'O recurso solicitado não foi encontrado.';
  }

  if (status === 409) {
    return 'Não foi possível concluir a operação porque os dados já existem.';
  }

  if (status >= 500) {
    return 'O servidor apresentou um erro. Tente novamente mais tarde.';
  }

  return 'Não foi possível concluir a solicitação.';
}

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const error = value as Record<string, unknown>;
  return typeof error.error === 'string' && typeof error.message === 'string';
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    throw new InvalidApiResponseError();
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
  } catch {
    throw new NetworkError();
  }

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiRequestError(response.status, isApiError(body) ? body : undefined);
  }

  return body as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  patch<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'PATCH' });
  },
};
