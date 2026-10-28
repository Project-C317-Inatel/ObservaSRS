import { ColetaAutonomaForm } from '../components/forms/ColetaAutonomaForm';

export function ColetaPage() {
  return (
    <section aria-labelledby="coleta-titulo" className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-magenta">
          Coleta autônoma
        </p>
        <h1 id="coleta-titulo" className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Informe os dados do seu estabelecimento
        </h1>
        <p className="mt-3 text-slate-600">
          Preencha o formulário com as informações do período de referência. Os dados são validados
          pela SMCELT antes da publicação.
        </p>

        <p className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-data-yellow"
            aria-hidden="true"
          />
          <span>
            Suas submissões ficam <strong>pendentes de validação pela SMCELT</strong> até a
            aprovação da equipe.
          </span>
        </p>

        <div className="mt-8 [&>form]:max-w-none">
          <ColetaAutonomaForm
            title="Dados do período"
            description="Preencha os campos e envie para validação."
          />
        </div>
      </div>
    </section>
  );
}
