import { KpiCard } from '../../components/ui/KpiCard';
import type { HighlightMetric } from './data';
import { useHighlightMetrics } from './useHighlightMetrics';

export interface HeroSectionProps {
  metrics?: readonly HighlightMetric[];
}

export function HeroSection({ metrics: explicitMetrics }: HeroSectionProps = {}) {
  const { metrics, status, error } = useHighlightMetrics(
    explicitMetrics !== undefined ? { metrics: explicitMetrics } : undefined,
  );

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

        {status === 'loading' && (
          <p className="mt-10 text-white/70" aria-live="polite">
            Carregando indicadores em destaque…
          </p>
        )}

        {status === 'error' && (
          <p className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 text-white/90">
            {error?.message ?? 'Não foi possível carregar os destaques no momento.'}
          </p>
        )}

        {status === 'ready' && metrics.length === 0 && (
          <p className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 text-white/90">
            Nenhum destaque disponível.
          </p>
        )}

        {status === 'ready' && metrics.length > 0 && (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <li key={metric.id}>
                <KpiCard
                  label={metric.label}
                  value={metric.value}
                  caption={metric.caption}
                  icon={metric.icon}
                  iconClass={metric.iconClass}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
