import type { SecondaryCard } from '../../types/indicators';

export interface SecondaryMetricCardsProps {
  cards: readonly SecondaryCard[];
}

export function SecondaryMetricCards({ cards }: SecondaryMetricCardsProps) {
  const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  return (
    <section aria-labelledby="metricas-secundarias">
      <h2 id="metricas-secundarias" className="text-lg font-semibold text-slate-900">
        Indicadores secundários
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-blue">
              {card.value === null ? '—' : numberFormat.format(card.value)}
              {card.value !== null && card.unit ? (
                <span className="ml-1 text-sm font-medium text-slate-500">{card.unit}</span>
              ) : null}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
