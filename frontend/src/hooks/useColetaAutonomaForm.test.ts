import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useColetaAutonomaForm, formatarCnpj } from './useColetaAutonomaForm';
import { enviarColeta } from '../services/coleta';
import type { ColetaAutonomaResponse } from '../types';

vi.mock('../services/coleta', () => ({
  enviarColeta: vi.fn(),
}));

describe('formatarCnpj', () => {
  it('deve formatar valor vazio', () => {
    expect(formatarCnpj('')).toBe('');
  });

  it('deve remover caracteres não numéricos', () => {
    expect(formatarCnpj('12.abc345')).toBe('12.345');
  });

  it('deve formatar CNPJ parcial progressivamente', () => {
    expect(formatarCnpj('12')).toBe('12');
    expect(formatarCnpj('123')).toBe('12.3');
    expect(formatarCnpj('12345')).toBe('12.345');
    expect(formatarCnpj('123456')).toBe('12.345.6');
    expect(formatarCnpj('12345678')).toBe('12.345.678');
    expect(formatarCnpj('123456780001')).toBe('12.345.678/0001');
  });

  it('deve formatar CNPJ completo com 14 dígitos', () => {
    expect(formatarCnpj('12345678000195')).toBe('12.345.678/0001-95');
  });

  it('deve truncar se exceder 14 dígitos', () => {
    expect(formatarCnpj('12345678000195999')).toBe('12.345.678/0001-95');
  });
});

describe('useColetaAutonomaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com valores padrão e estado limpo', () => {
    const { result } = renderHook(() => useColetaAutonomaForm());

    expect(result.current.values).toEqual({
      nomeEstabelecimento: '',
      cnpjCadastur: '',
      periodoReferencia: '',
      leitosOcupados: 0,
      origemVisitantes: '',
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.status).toBe('idle');
    expect(result.current.feedback).toBeNull();
  });

  it('deve atualizar campos via updateField e limpar erros prévios do campo', () => {
    const { result } = renderHook(() => useColetaAutonomaForm());

    act(() => {
      // aciona validação para gerar erros
      void result.current.submit();
    });

    expect(result.current.errors.nomeEstabelecimento).toBeDefined();

    act(() => {
      result.current.updateField('nomeEstabelecimento', 'Pousada do Vale');
    });

    expect(result.current.values.nomeEstabelecimento).toBe('Pousada do Vale');
    expect(result.current.errors.nomeEstabelecimento).toBeUndefined();
    expect(result.current.status).toBe('idle');
    expect(result.current.feedback).toBeNull();
  });

  it('deve validar campos obrigatórios no submit e não chamar a API quando inválido', async () => {
    const { result } = renderHook(() => useColetaAutonomaForm());

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errors.nomeEstabelecimento).toBe(
      'Informe o nome do estabelecimento (mínimo 3 caracteres).',
    );
    expect(result.current.errors.cnpjCadastur).toBe(
      'Informe um CNPJ válido no formato 00.000.000/0001-00.',
    );
    expect(result.current.errors.periodoReferencia).toBe('Selecione o período de referência.');
    expect(enviarColeta).not.toHaveBeenCalled();
  });

  it('deve validar CNPJ com menos de 14 dígitos', async () => {
    const { result } = renderHook(() => useColetaAutonomaForm());

    act(() => {
      result.current.updateField('nomeEstabelecimento', 'Hotel Bela Vista');
      result.current.updateField('cnpjCadastur', '12.345.678');
      result.current.updateField('periodoReferencia', '2026-10');
      result.current.updateField('leitosOcupados', 15);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.errors.cnpjCadastur).toBe(
      'Informe um CNPJ válido no formato 00.000.000/0001-00.',
    );
    expect(enviarColeta).not.toHaveBeenCalled();
  });

  it('deve validar leitos ocupados negativos', async () => {
    const { result } = renderHook(() => useColetaAutonomaForm());

    act(() => {
      result.current.updateField('nomeEstabelecimento', 'Hotel Central');
      result.current.updateField('cnpjCadastur', '12.345.678/0001-95');
      result.current.updateField('periodoReferencia', '2026-10');
      result.current.updateField('leitosOcupados', -5);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.errors.leitosOcupados).toBe(
      'Informe o número de leitos ocupados (valor ≥ 0).',
    );
    expect(enviarColeta).not.toHaveBeenCalled();
  });

  it('deve enviar com sucesso, resetar formulário e definir feedback positivo', async () => {
    const mockResponse: ColetaAutonomaResponse = {
      message: 'Coleta enviada com sucesso para validação da SMCELT.',
      coleta: {
        id: 'coleta-uuid-1',
        nomeEstabelecimento: 'Pousada Encanto',
        cnpjCadastur: '12.345.678/0001-95',
        periodoReferencia: '2026-10',
        leitosOcupados: 20,
        origemVisitantes: 'sudeste',
      },
    };

    vi.mocked(enviarColeta).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useColetaAutonomaForm());

    act(() => {
      result.current.updateField('nomeEstabelecimento', 'Pousada Encanto');
      result.current.updateField('cnpjCadastur', '12.345.678/0001-95');
      result.current.updateField('periodoReferencia', '2026-10');
      result.current.updateField('leitosOcupados', 20);
      result.current.updateField('origemVisitantes', 'sudeste');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(enviarColeta).toHaveBeenCalledWith({
      nomeEstabelecimento: 'Pousada Encanto',
      cnpjCadastur: '12.345.678/0001-95',
      periodoReferencia: '2026-10',
      leitosOcupados: 20,
      origemVisitantes: 'sudeste',
    });
    expect(result.current.status).toBe('success');
    expect(result.current.feedback).toBe('Coleta enviada com sucesso para validação da SMCELT.');
    // formulário resetado para valores padrão
    expect(result.current.values).toEqual({
      nomeEstabelecimento: '',
      cnpjCadastur: '',
      periodoReferencia: '',
      leitosOcupados: 0,
      origemVisitantes: '',
    });
  });

  it('deve lidar com falha no envio e exibir feedback de erro', async () => {
    vi.mocked(enviarColeta).mockRejectedValueOnce(new Error('Falha na comunicação com o servidor'));

    const { result } = renderHook(() => useColetaAutonomaForm());

    act(() => {
      result.current.updateField('nomeEstabelecimento', 'Pousada Encanto');
      result.current.updateField('cnpjCadastur', '12.345.678/0001-95');
      result.current.updateField('periodoReferencia', '2026-10');
      result.current.updateField('leitosOcupados', 20);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.feedback).toBe('Falha na comunicação com o servidor');
  });

  it('deve redefinir todos os campos, erros e status ao chamar reset', () => {
    const { result } = renderHook(() => useColetaAutonomaForm());

    act(() => {
      result.current.updateField('nomeEstabelecimento', 'Pousada Encanto');
      result.current.updateField('cnpjCadastur', '12.345.678/0001-95');
      result.current.updateField('periodoReferencia', '2026-10');
      result.current.updateField('leitosOcupados', 20);
      result.current.updateField('origemVisitantes', 'sul');
      void result.current.submit();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({
      nomeEstabelecimento: '',
      cnpjCadastur: '',
      periodoReferencia: '',
      leitosOcupados: 0,
      origemVisitantes: '',
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.status).toBe('idle');
    expect(result.current.feedback).toBeNull();
  });
});
