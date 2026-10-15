import { HIGHLIGHT_METRICS, type HighlightMetric } from './data';

export interface HeroSectionProps {
  metrics?: readonly HighlightMetric[];
}

const numberFormat = new Intl.NumberFormat('pt-BR');

export function HeroSection({ metrics = HIGHLIGHT_METRICS }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative overflow-hidden bg-brand-gradient px-4 py-14 text-white sm:px-6 sm:py-20"
    >
      {/* Círculos decorativos do fundo */}
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] size-96 rounded-full bg-white/10 sm:size-128"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl">
        <p className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-data-yellow">
          Cidade criativa · Cidade feliz
        </p>
        <h1 id="hero-titulo" className="mt-6 text-4xl font-extrabold sm:text-6xl">
          Observa SRS
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/85 sm:text-xl">
          Observatório de cultura, lazer, esporte e turismo de Santa Rita do Sapucaí. Dados abertos
          e transparentes para gestores, empreendedores, pesquisadores e cidadãos.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <li key={metric.id} className="rounded-2xl bg-white p-5 text-slate-900 shadow-lg">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${metric.iconClass}`}
              >
                <img src={metric.icon} alt="" className="h-6 w-6" />
              </span>
              <p className="mt-4 text-3xl font-extrabold">{numberFormat.format(metric.value)}</p>
              <p className="mt-1 font-semibold text-slate-800">{metric.label}</p>
              <p className="mt-1 text-sm text-slate-500">{metric.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}