import { Link } from 'react-router';

import { KpiCard } from '../../components/ui/KpiCard';
import { Logo } from '../../components/ui/Logo';
import { CityPhotoMosaic } from './CityPhotoMosaic';
import type { HighlightMetric } from './data';
import { HeroBlobs } from './HeroBlobs';
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
      className="relative overflow-hidden bg-surface-cream px-4 py-16 font-body sm:px-6 lg:py-24"
    >
      <HeroBlobs />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-block rounded-full bg-data-yellow px-6 py-2 font-hand text-2xl font-bold text-brand-purple sm:text-3xl">
            Cidade criativa · Cidade feliz
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Logo className="h-16 w-auto shrink-0 sm:h-20" />
            <h1
              id="hero-titulo"
              className="bg-brand-gradient bg-clip-text font-display text-6xl leading-none text-transparent uppercase sm:text-7xl lg:text-8xl"
            >
              Observa SRS
            </h1>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-slate-700 sm:text-xl">
            Observatório de cultura, lazer, esporte e turismo de Santa Rita do Sapucaí. Dados
            abertos e transparentes para gestores, empreendedores, pesquisadores e cidadãos.
          </p>

          <Link
            to="/cidade"
            className="mt-6 inline-block rounded-lg bg-brand-gradient bg-clip-text text-xl font-medium text-transparent decoration-brand-purple underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-purple"
          >
            Conheça a cidade <span aria-hidden="true">→</span>
          </Link>

          {status === 'loading' && (
            <p className="mt-10 text-slate-600" aria-live="polite">
              Carregando indicadores em destaque…
            </p>
          )}

          {status === 'error' && (
            <p className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
              {error?.message ?? 'Não foi possível carregar os destaques no momento.'}
            </p>
          )}

          {status === 'ready' && metrics.length === 0 && (
            <p className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
              Nenhum destaque disponível.
            </p>
          )}

          {status === 'ready' && metrics.length > 0 && (
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

        <CityPhotoMosaic />
      </div>
    </section>
  );
}