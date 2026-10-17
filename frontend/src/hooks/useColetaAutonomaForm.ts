import { useState } from 'react';

import { enviarColeta } from '../services/coleta';
import type { ColetaAutonomaRequest } from '../types';
import type { AsyncStatus, ColetaAutonomaErrors, ColetaAutonomaField } from '../types/forms';

const initialValues: ColetaAutonomaRequest = {
  nomeEstabelecimento: '',
  cnpjCadastur: '',
  periodoReferencia: '',
  leitosOcupados: 0,
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

function validate(values: ColetaAutonomaRequest): ColetaAutonomaErrors {
  const errors: ColetaAutonomaErrors = {};

  if (!values.nomeEstabelecimento.trim() || values.nomeEstabelecimento.trim().length < 3) {
    errors.nomeEstabelecimento = 'Informe o nome do estabelecimento (mínimo 3 caracteres).';
  }

  const cnpjNumeros = values.cnpjCadastur.replace(/\D/g, '');
  if (cnpjNumeros.length !== 14) {
    errors.cnpjCadastur = 'Informe um CNPJ válido no formato 00.000.000/0001-00.';
  }

  if (!values.periodoReferencia || !/^\d{4}-\d{2}$/.test(values.periodoReferencia)) {
    errors.periodoReferencia = 'Selecione o período de referência.';
  }

  if (
    typeof values.leitosOcupados !== 'number' ||
    Number.isNaN(values.leitosOcupados) ||
    values.leitosOcupados < 0
  ) {
    errors.leitosOcupados = 'Informe o número de leitos ocupados (valor ≥ 0).';
  }

  return errors;
}

export function useColetaAutonomaForm() {
  const [values, setValues] = useState<ColetaAutonomaRequest>(initialValues);
  const [errors, setErrors] = useState<ColetaAutonomaErrors>({});
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  function updateField<K extends ColetaAutonomaField>(field: K, value: ColetaAutonomaRequest[K]) {
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
      const response = await enviarColeta(values);
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
