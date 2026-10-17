import type { ChangeEvent } from 'react';

import { Button } from '../../components/ui/Button';
import type { IndicatorFilters, IndicatorOptions } from '../../types/indicators';
import { formatPeriod } from './format';

export interface IndicatorsFiltersProps {
  filters: IndicatorFilters;
  options: IndicatorOptions;
  onFilterChange: <K extends keyof IndicatorFilters>(filter: K, value: IndicatorFilters[K]) => void;
  onReset: () => void;
}

const selectValue = (value: string | number | null) => (value === null ? '' : String(value));

export function IndicatorsFilters({
  filters,
  options,
  onFilterChange,
  onReset,
}: IndicatorsFiltersProps) {
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('year', event.target.value === '' ? null : Number(event.target.value));
  };
  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('period', event.target.value === '' ? null : event.target.value);
  };
  const handleSectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('sector', event.target.value === '' ? null : event.target.value);
  };

  return (
    <section
      aria-labelledby="filtros-indicadores"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="filtros-indicadores" className="text-lg font-semibold text-slate-900">
            Filtros
          </h2>
          <p className="text-sm text-slate-600">
            Refine os dados exibidos no fluxo de visitantes e nos indicadores secundários.
          </p>
        </div>
        <Button variant="ghost" className="mt-2 px-3 py-2 text-sm sm:mt-0" onClick={onReset}>
          Limpar filtros
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="indicadores-ano">
          Ano
          <select
            id="indicadores-ano"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            value={selectValue(filters.year)}
            onChange={handleYearChange}
          >
            <option value="">Todos os anos</option>
            {options.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700" htmlFor="indicadores-periodo">
          Período
          <select
            id="indicadores-periodo"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            value={selectValue(filters.period)}
            onChange={handlePeriodChange}
          >
            <option value="">Todos os períodos</option>
            {options.periods.map((period) => (
              <option key={period} value={period}>
                {formatPeriod(period)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700" htmlFor="indicadores-setor">
          Setor
          <select
            id="indicadores-setor"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
            value={selectValue(filters.sector)}
            onChange={handleSectorChange}
          >
            <option value="">Todos os setores</option>
            {options.sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
