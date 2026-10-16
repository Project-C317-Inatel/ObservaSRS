import type { FormEvent } from 'react';

import { useColetaAutonomaForm, formatarCnpj } from '../../hooks/useColetaAutonomaForm';
import { Button } from '../ui/Button';

export interface ColetaAutonomaFormProps {
  title?: string;
  description?: string;
}

export function ColetaAutonomaForm({
  title = 'Coleta Autônoma',
  description = 'Envie os dados de ocupação do seu estabelecimento para validação da SMCELT.',
}: ColetaAutonomaFormProps) {
  const { values, errors, status, feedback, updateField, submit, reset } = useColetaAutonomaForm();

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
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <div className="mt-6 space-y-4">
        {/* Campo 1: Nome do Estabelecimento */}
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="nomeEstabelecimento">
            Nome do Estabelecimento
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            id="nomeEstabelecimento"
            name="nomeEstabelecimento"
            type="text"
            value={values.nomeEstabelecimento}
            onChange={(event) => updateField('nomeEstabelecimento', event.target.value)}
            aria-describedby={errors.nomeEstabelecimento ? 'nomeEstabelecimento-error' : undefined}
            aria-invalid={Boolean(errors.nomeEstabelecimento)}
            disabled={isLoading}
            placeholder="Ex: Hotel ou Pousada Central"
          />
          {errors.nomeEstabelecimento ? (
            <p className="mt-1 text-sm text-red-600" id="nomeEstabelecimento-error">
              {errors.nomeEstabelecimento}
            </p>
          ) : null}
        </div>

        {/* Campo 2: CNPJ / Cadastur */}
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="cnpjCadastur">
            CNPJ / Cadastur
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            id="cnpjCadastur"
            name="cnpjCadastur"
            type="text"
            value={values.cnpjCadastur}
            onChange={(event) => updateField('cnpjCadastur', formatarCnpj(event.target.value))}
            aria-describedby={errors.cnpjCadastur ? 'cnpjCadastur-error' : undefined}
            aria-invalid={Boolean(errors.cnpjCadastur)}
            disabled={isLoading}
            placeholder="00.000.000/0001-00"
            maxLength={18}
          />
          {errors.cnpjCadastur ? (
            <p className="mt-1 text-sm text-red-600" id="cnpjCadastur-error">
              {errors.cnpjCadastur}
            </p>
          ) : null}
        </div>

        {/* Campo 3: Período de Referência */}
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="periodoReferencia">
            Período de Referência
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            id="periodoReferencia"
            name="periodoReferencia"
            type="month"
            value={values.periodoReferencia}
            onChange={(event) => updateField('periodoReferencia', event.target.value)}
            aria-describedby={errors.periodoReferencia ? 'periodoReferencia-error' : undefined}
            aria-invalid={Boolean(errors.periodoReferencia)}
            disabled={isLoading}
          />
          {errors.periodoReferencia ? (
            <p className="mt-1 text-sm text-red-600" id="periodoReferencia-error">
              {errors.periodoReferencia}
            </p>
          ) : null}
        </div>

        {/* Campo 4: Nº de Leitos Ocupados */}
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="leitosOcupados">
            Nº de Leitos Ocupados
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            id="leitosOcupados"
            name="leitosOcupados"
            type="number"
            min={0}
            step={1}
            value={values.leitosOcupados === 0 ? '' : values.leitosOcupados}
            onChange={(event) => {
              const val = event.target.value;
              updateField('leitosOcupados', val === '' ? 0 : parseInt(val, 10));
            }}
            aria-describedby={errors.leitosOcupados ? 'leitosOcupados-error' : undefined}
            aria-invalid={Boolean(errors.leitosOcupados)}
            disabled={isLoading}
            placeholder="0"
          />
          {errors.leitosOcupados ? (
            <p className="mt-1 text-sm text-red-600" id="leitosOcupados-error">
              {errors.leitosOcupados}
            </p>
          ) : null}
        </div>

        {/* Campo 5: Principal Origem dos Visitantes */}
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="origemVisitantes">
            Principal Origem dos Visitantes
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            id="origemVisitantes"
            name="origemVisitantes"
            value={values.origemVisitantes}
            onChange={(event) => updateField('origemVisitantes', event.target.value)}
            disabled={isLoading}
          >
            <option value="">Selecione...</option>
            <option value="local">Local / Regional</option>
            <option value="estado">Outros municípios de MG</option>
            <option value="sudeste">Região Sudeste (outros estados)</option>
            <option value="sul">Região Sul</option>
            <option value="nordeste">Região Nordeste</option>
            <option value="norte_centro_oeste">Regiões Norte / Centro-Oeste</option>
            <option value="internacional">Internacional</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:flex-1" type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </Button>
        <Button
          className="w-full sm:w-auto"
          variant="secondary"
          type="button"
          onClick={reset}
          disabled={isLoading}
        >
          Limpar
        </Button>
      </div>

      {feedback ? (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
            status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
          role={status === 'success' ? 'status' : 'alert'}
          aria-live="polite"
        >
          {status === 'success' ? (
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span className="font-medium leading-relaxed">{feedback}</span>
        </div>
      ) : null}
    </form>
  );
}
