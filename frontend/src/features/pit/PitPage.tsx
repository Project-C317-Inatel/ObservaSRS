import { PIT_CATEGORIES, formatPitDate, type PitItem } from './data';
import { usePit } from './usePit';

export interface PitPageProps {
  items?: readonly PitItem[];
}

/** Gradientes de reserva enquanto os itens não tiverem foto cadastrada. */
const CATEGORY_COVER: Record<string, string> = {
  'Atração Natural': 'from-data-cyan to-data-sky',
  'Museu / Cultura': 'from-brand-blue to-brand-purple',
  Gastronomia: 'from-data-yellow to-brand-magenta',
  'Parque Urbano': 'from-data-cyan to-brand-blue',
  'Evento / Comércio': 'from-brand-purple to-brand-magenta',
  'Arte / Cultura': 'from-data-lilac to-brand-magenta',
};

export function PitPage({ items: explicitItems }: PitPageProps = {}) {
  const { items, status, error, activeCategory, setCategory } = usePit(
    explicitItems !== undefined ? { items: explicitItems } : undefined,
  );

  return (
    <section aria-labelledby="pit-titulo" className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-magenta">
          Inventário turístico
        </p>
        <h1 id="pit-titulo" className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          PIT — Plano de Inventário Turístico
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Atrações, equipamentos e serviços turísticos cadastrados em Santa Rita do Sapucaí. Dados
          atualizados periodicamente pela SMCELT.
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          <FilterChip active={activeCategory === null} onClick={() => setCategory(null)}>
            Todos
          </FilterChip>
          {[
            ...new Set([
              ...PIT_CATEGORIES,
              ...items.map((item) => item.categoria),
              ...(activeCategory ? [activeCategory] : []),
            ]),
          ].map((option) => (
            <FilterChip
              key={option}
              active={activeCategory === option}
              onClick={() => setCategory(option)}
            >
              {option}
            </FilterChip>
          ))}
        </div>

        {status === 'loading' && (
          <p className="mt-8 text-slate-500" aria-live="polite">
            Carregando inventário…
          </p>
        )}

        {status === 'error' && (
          <p className="mt-8 rounded-2xl border border-dashed border-red-300 p-8 text-center text-red-600">
            {error?.message ?? 'Não foi possível carregar o inventário. Tente novamente.'}
          </p>
        )}

        {status === 'ready' && items.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Nenhum item cadastrado nesta categoria.
          </p>
        )}

        {status === 'ready' && items.length > 0 && (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative h-44">
                  {item.imagemUrl ? (
                    <img
                      src={item.imagemUrl}
                      alt={item.nome}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-linear-to-br ${CATEGORY_COVER[item.categoria] ?? 'from-brand-blue to-brand-purple'}`}
                      aria-hidden="true"
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
                    {item.categoria}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-slate-900">{item.nome}</h2>
                  <p className="mt-1 text-sm text-slate-600">{item.descricao}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {item.localizacao} · Atualizado em{' '}
                    <time dateTime={item.atualizadoEm}>{formatPitDate(item.atualizadoEm)}</time>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple ${
        active
          ? 'bg-brand-gradient text-white shadow-sm'
          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
