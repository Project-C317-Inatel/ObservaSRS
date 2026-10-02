import type { FormEvent } from 'react';

import { useLoginForm } from '../../hooks/useLoginForm';
import { Button } from '../ui/Button';

export interface LoginFormProps {
  title?: string;
}

export function LoginForm({ title = 'Acesso administrativo' }: LoginFormProps) {
  const { values, errors, status, feedback, updateField, submit } = useLoginForm();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  const isLoading = status === 'loading';

  return (
    <form
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">Entre para acessar a área da SMCELT.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">
            E-mail
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            disabled={isLoading}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600" id="email-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="senha">
            Senha
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            id="senha"
            name="senha"
            type="password"
            value={values.senha}
            onChange={(event) => updateField('senha', event.target.value)}
            aria-describedby={errors.senha ? 'senha-error' : undefined}
            aria-invalid={Boolean(errors.senha)}
            autoComplete="current-password"
            disabled={isLoading}
          />
          {errors.senha ? (
            <p className="mt-1 text-sm text-red-600" id="senha-error">
              {errors.senha}
            </p>
          ) : null}
        </div>
      </div>

      <Button className="mt-6 w-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>

      {feedback ? (
        <p
          className={`mt-4 text-sm ${status === 'success' ? 'text-green-700' : 'text-red-600'}`}
          role="status"
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
