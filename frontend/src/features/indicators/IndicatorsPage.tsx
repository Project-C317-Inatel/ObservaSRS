import { Button } from '../../components/ui/Button';
import { useIndicators } from './useIndicators';
import { IndicatorsFilters } from './IndicatorsFilters';
import { SecondaryMetricCards } from './SecondaryMetricCards';
import { VisitorFlowChart } from './VisitorFlowChart';

export function IndicatorsPage() {
  const indicators = useIndicators();
  const { filters, options, status, chartType, visitorFlow, secondaryCards } = indicators;

  return (
    <section
      aria-labelledby="indicadores-titulo"
      className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-purple">
            Painel público
          </p>
          <h1
            id="indicadores-titulo"
            className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl"
          >
            Indicadores de turismo
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Acompanhe o fluxo de visitantes e os principais resultados do turismo em Santa Rita do
            Sapucaí.
          </p>
        </div>

        <IndicatorsFilters
          filters={filters}
          options={options}
          onFilterChange={indicators.setFilter}
          onReset={indicators.resetFilters}
        />

        <div className="mt-6 space-y-6">
          {status === 'loading' ? <LoadingState /> : null}
          {status === 'error' ? <ErrorState message={indicators.error?.message} /> : null}
          {status === 'empty' ? <EmptyState /> : null}
          {status === 'ready' ? (
            <>
              <section
                aria-labelledby="fluxo-visitantes"
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 id="fluxo-visitantes" className="text-lg font-semibold text-slate-900">
                      Fluxo de visitantes
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">Total registrado por período.</p>
                  </div>
                  <div
                    className="flex rounded-lg border border-slate-200 p-1"
                    aria-label="Tipo de gráfico"
                    role="group"
                  >
                    <Button
                      className="px-3 py-1.5 text-sm"
                      variant={chartType === 'bar' ? 'primary' : 'ghost'}
                      aria-pressed={chartType === 'bar'}
                      onClick={() => indicators.setChartType('bar')}
                    >
                      Barras
                    </Button>
                    <Button
                      className="px-3 py-1.5 text-sm"
                      variant={chartType === 'line' ? 'primary' : 'ghost'}
                      aria-pressed={chartType === 'line'}
                      onClick={() => indicators.setChartType('line')}
                    >
                      Linha
                    </Button>
                  </div>
                </div>
                <VisitorFlowChart data={visitorFlow} chartType={chartType} />
              </section>
              <SecondaryMetricCards cards={secondaryCards} />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      role="status"
    >
      <p className="font-medium text-slate-700">Carregando indicadores...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"
      role="status"
    >
      <p className="font-semibold text-slate-800">Nenhum dado encontrado</p>
      <p className="mt-1 text-sm text-slate-600">
        Tente remover ou ajustar os filtros selecionados.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900" role="alert">
      <p className="font-semibold">Não foi possível carregar os indicadores.</p>
      <p className="mt-1 text-sm">{message ?? 'Tente novamente mais tarde.'}</p>
    </div>
  );
}
