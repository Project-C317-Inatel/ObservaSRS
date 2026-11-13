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

const IDENTIFICADOR_MIN_LENGTH = 3;
const IDENTIFICADOR_MAX_LENGTH = 30;

const initialValues: ColetaAutonomaFormValues = {
  nomeEstabelecimento: '',
  cnpjCadastur: '',
  periodoReferencia: '',
  leitosOcupados: null,
  origemVisitantes: '',
};

function normalizarIdentificador(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function formatarCnpj(value: string): string {
  const identifier = normalizarIdentificador(value).slice(0, IDENTIFICADOR_MAX_LENGTH);
  const isNumericCnpj = /^\d+$/.test(identifier);
  const isCompleteAlphanumericCnpj =
    identifier.length === 14 && /^\d{2}$/.test(identifier.slice(12));

  if (!isNumericCnpj && !isCompleteAlphanumericCnpj) {
    return identifier;
  }

  if (identifier.length <= 2) {
    return identifier;
  }
  if (identifier.length <= 5) {
    return `${identifier.slice(0, 2)}.${identifier.slice(2)}`;
  }
  if (identifier.length <= 8) {
    return `${identifier.slice(0, 2)}.${identifier.slice(2, 5)}.${identifier.slice(5)}`;
  }
  if (identifier.length <= 12) {
    return `${identifier.slice(0, 2)}.${identifier.slice(2, 5)}.${identifier.slice(5, 8)}/${identifier.slice(8)}`;
  }

  return `${identifier.slice(0, 2)}.${identifier.slice(2, 5)}.${identifier.slice(5, 8)}/${identifier.slice(8, 12)}-${identifier.slice(12, 14)}`;
}

export function validarCnpj(cnpj: string): boolean {
  const identifier = normalizarIdentificador(cnpj);
  if (identifier.length !== 14 || !/^[A-Z0-9]{14}$/.test(identifier)) return false;
  if (!/^\d{2}$/.test(identifier.slice(12))) return false;
  if (/^([A-Z0-9])\1{13}$/.test(identifier)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += (identifier.charCodeAt(i) - 48) * (weights1[i] ?? 0);
  }
  const rest1 = sum1 % 11;
  const dv1 = rest1 < 2 ? 0 : 11 - rest1;
  if (Number(identifier[12]) !== dv1) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += (identifier.charCodeAt(i) - 48) * (weights2[i] ?? 0);
  }
  const rest2 = sum2 % 11;
  const dv2 = rest2 < 2 ? 0 : 11 - rest2;
  return Number(identifier[13]) === dv2;
}

export function validarCnpjOuCadastur(value: string): boolean {
  const identifier = normalizarIdentificador(value);
  if (
    identifier.length < IDENTIFICADOR_MIN_LENGTH ||
    identifier.length > IDENTIFICADOR_MAX_LENGTH
  ) {
    return false;
  }

  const isCnpjCandidate = identifier.length === 14 && /^\d{2}$/.test(identifier.slice(12));
  return !isCnpjCandidate || validarCnpj(identifier);
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

  if (!validarCnpjOuCadastur(values.cnpjCadastur)) {
    errors.cnpjCadastur = 'Informe um CNPJ ou Cadastur válido.';
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
        cnpjCadastur: normalizarIdentificador(values.cnpjCadastur),
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
