import { useState } from 'react';

import { login } from '../services/auth';
import type { LoginRequest } from '../types';
import type { AsyncStatus, LoginErrors } from '../types/forms';

const initialValues: LoginRequest = {
  email: '',
  senha: '',
};

function validate(values: LoginRequest): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Informe seu e-mail.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!values.senha) {
    errors.senha = 'Informe sua senha.';
  }

  return errors;
}

export function useLoginForm() {
  const [values, setValues] = useState<LoginRequest>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  function updateField(field: keyof LoginRequest, value: string) {
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
      const response = await login(values);
      setStatus('success');
      setFeedback(`Bem-vindo, ${response.usuario.nome}.`);
    } catch (error: unknown) {
      setStatus('error');
      setFeedback(error instanceof Error ? error.message : 'Não foi possível realizar o login.');
    }
  }

  return {
    values,
    errors,
    status,
    feedback,
    updateField,
    submit,
  };
}
