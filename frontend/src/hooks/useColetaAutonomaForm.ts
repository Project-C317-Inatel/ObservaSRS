import { useState } from 'react';

import { enviarColeta } from '../services/coleta';
import type { ColetaAutonomaRequest } from '../types';
import type { AsyncStatus, ColetaAutonomaErrors, ColetaAutonomaField } from '../types/forms';

export interface ColetaAutonomaFormValues {
  nomeEstabelecimento: string;
  cnpjCadastur: string;
  periodoReferencia: string;
  leitosOcupados: number | null;
  origemVisitantes: string;
}

const initialValues: ColetaAutonomaFormValues = {
  nomeEstabelecimento: '',
  cnpjCadastur: '',
  periodoReferencia: '',
  leitosOcupados: null,
  origemVisitantes: '',
};

export function formatarCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function validarCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += Number(digits[i]) * (weights1[i] ?? 0);
  }
  const rest1 = sum1 % 11;
  const dv1 = rest1 < 2 ? 0 : 11 - rest1;
  if (Number(digits[12]) !== dv1) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += Number(digits[i]) * (weights2[i] ?? 0);
  }
  const rest2 = sum2 % 11;
  const dv2 = rest2 < 2 ? 0 : 11 - rest2;
  return Number(digits[13]) === dv2;
}

export function obterMesAtualIso(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

function validate(values: ColetaAutonomaFormValues): ColetaAutonomaErrors {
  const errors: ColetaAutonomaErrors = {};

  if (!values.nomeEstabelecimento.trim() || values.nomeEstabelecimento.trim().length < 3) {
    errors.nomeEstabelecimento = 'Informe o nome do estabelecimento (mínimo 3 caracteres).';
  }

  const cnpjNumeros = values.cnpjCadastur.replace(/\D/g, '');
  if (cnpjNumeros.length !== 14 || !validarCnpj(cnpjNumeros)) {
    errors.cnpjCadastur = 'Informe um CNPJ válido no formato 00.000.000/0001-00.';
  }

  if (!values.periodoReferencia || !/^\d{4}-(0[1-9]|1[0-2])$/.test(values.periodoReferencia)) {
    errors.periodoReferencia = 'Selecione o período de referência.';
  } else if (values.periodoReferencia > obterMesAtualIso()) {
    errors.periodoReferencia = 'O período de referência não pode ser futuro.';
  }

  if (
    values.leitosOcupados === null ||
    typeof values.leitosOcupados !== 'number' ||
    Number.isNaN(values.leitosOcupados) ||
    values.leitosOcupados < 0
  ) {
    errors.leitosOcupados = 'Informe o número de leitos ocupados (valor ≥ 0).';
  }

  if (values.origemVisitantes.length > 120) {
    errors.origemVisitantes = 'A origem dos visitantes deve ter no máximo 120 caracteres.';
  }

  return errors;
}

export function useColetaAutonomaForm() {
  const [values, setValues] = useState<ColetaAutonomaFormValues>(initialValues);
  const [errors, setErrors] = useState<ColetaAutonomaErrors>({});
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  function updateField<K extends ColetaAutonomaField>(
    field: K,
    value: ColetaAutonomaFormValues[K],
  ) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setFeedback(null);
    setStatus('idle');
  }

  async function submit() {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setFeedback(null);

    if (Object.keys(validationErrors).length > 0) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const payload: ColetaAutonomaRequest = {
        nomeEstabelecimento: values.nomeEstabelecimento.trim(),
        cnpjCadastur: values.cnpjCadastur,
        periodoReferencia: values.periodoReferencia,
        leitosOcupados: values.leitosOcupados as number,
        origemVisitantes: values.origemVisitantes.trim(),
      };
      const response = await enviarColeta(payload);
      setStatus('success');
      setFeedback(response.message || 'Coleta enviada com sucesso para validação da SMCELT.');
      setValues(initialValues);
    } catch (error: unknown) {
      setStatus('error');
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar os dados da coleta autônoma.',
      );
    }
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setStatus('idle');
    setFeedback(null);
  }

  return {
    values,
    errors,
    status,
    feedback,
    updateField,
    submit,
    reset,
  };
}
