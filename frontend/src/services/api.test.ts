import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiRequestError, InvalidApiResponseError, NetworkError } from './api';

describe('api client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('executa GET com credentials include e cabeçalho json', async () => {
    const mockData = { id: '1', nome: 'Hotel Centro' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    });
    globalThis.fetch = fetchMock;

    const result = await api.get('/destaque');

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3333/destaque', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  });

  it('executa POST serializando body em JSON', async () => {
    const payload = { nome: 'Novo Item' };
    const mockResponse = { id: '1', ...payload };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });
    globalThis.fetch = fetchMock;

    const result = await api.post('/itens', payload);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3333/itens', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  });

  it('executa POST com FormData sem fixar Content-Type', async () => {
    const formData = new FormData();
    formData.append('arquivo', new Blob(['conteudo']), 'relatorio.pdf');

    const mockResponse = { id: 'r1', titulo: 'Relatório' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });
    globalThis.fetch = fetchMock;

    const result = await api.post('/admin/relatorios', formData);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3333/admin/relatorios', {
      method: 'POST',
      body: formData,
      headers: {},
      credentials: 'include',
    });
  });

  it('executa PATCH com body serializado em JSON', async () => {
    const payload = { publicado: true };
    const mockResponse = { id: 'reg-1', publicado: true };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });
    globalThis.fetch = fetchMock;

    const result = await api.patch('/admin/registros-indicadores/reg-1', payload);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3333/admin/registros-indicadores/reg-1',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    );
  });

  it('executa PATCH sem body', async () => {
    const mockResponse = { sucesso: true };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });
    globalThis.fetch = fetchMock;

    const result = await api.patch('/admin/aprovar');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3333/admin/aprovar', {
      method: 'PATCH',
      body: undefined,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  });

  it('executa DELETE com sucesso', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });
    globalThis.fetch = fetchMock;

    const result = await api.delete('/admin/relatorios/123');

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3333/admin/relatorios/123', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  });

  it('retorna undefined sem erro quando o status é 204 No Content', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers({ 'content-type': 'application/json' }),
    });
    globalThis.fetch = fetchMock;

    const result = await api.delete('/admin/pit/456');

    expect(result).toBeUndefined();
  });

  it('retorna undefined quando resposta não possui content-type json', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/plain' }),
    });
    globalThis.fetch = fetchMock;

    const result = await api.get('/texto');

    expect(result).toBeUndefined();
  });

  it('lança NetworkError se fetch falhar', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.get('/erro')).rejects.toThrow(NetworkError);
  });

  it('lança InvalidApiResponseError se JSON da resposta for inválido', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => {
        throw new Error('Unexpected token');
      },
    });

    await expect(api.get('/invalido')).rejects.toThrow(InvalidApiResponseError);
  });

  it('lança ApiRequestError com detalhes da API quando a requisição falhar', async () => {
    const apiError = {
      error: 'validation_error',
      message: 'Dados inválidos.',
      details: [{ field: 'nome', message: 'obrigatório' }],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => apiError,
    });

    await expect(api.post('/itens', {})).rejects.toThrow(ApiRequestError);
    await expect(api.post('/itens', {})).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 400,
      code: 'validation_error',
      message: 'Dados inválidos.',
      details: apiError.details,
    });
  });

  it('lança ApiRequestError com mensagem padrão quando o erro não seguir formato ApiError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'text/plain' }),
    });

    await expect(api.get('/nao-encontrado')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 404,
      code: null,
      message: 'O recurso solicitado não foi encontrado.',
    });
  });
});
