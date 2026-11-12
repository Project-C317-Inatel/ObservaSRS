import { useCallback, useEffect, useMemo, useState } from 'react';

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarRegistrosPublicados } from '../../services/indicadores';
import { INDICATOR_DATA, SECONDARY_METRIC_DEFINITIONS } from './data';
import { adaptIndicatorRecords } from './adapter';
import {
  aggregateVisitorFlow,
  deriveSecondaryCards,
  filterIndicators,
  getIndicatorOptions,
} from './logic';
import type {
  ChartType,
  IndicatorFilters,
  IndicatorOptions,
  IndicatorRecord,
  SecondaryCard,
  SecondaryMetricDefinition,
  VisitorFlowPoint,
} from '../../types/indicators';

export type IndicatorsStatus = 'loading' | 'ready' | 'empty' | 'error';

export interface UseIndicatorsOptions {
  records?: readonly IndicatorRecord[];
  metricDefinitions?: readonly SecondaryMetricDefinition[];
  initialFilters?: Partial<IndicatorFilters>;
  initialChartType?: ChartType;
}

export interface IndicatorsViewState {
  filters: IndicatorFilters;
  chartType: ChartType;
  options: IndicatorOptions;
  availableYears: number[];
  availablePeriods: string[];
  availableSectors: string[];
  visitorFlow: VisitorFlowPoint[];
  secondaryCards: SecondaryCard[];
  status: IndicatorsStatus;
  isLoading: boolean;
  isEmpty: boolean;
  error: Error | null;
}

export interface IndicatorsActions {
  setFilter<K extends keyof IndicatorFilters>(filter: K, value: IndicatorFilters[K]): void;
  setFilters(filters: Partial<IndicatorFilters>): void;
  resetFilters(): void;
  setChartType(chartType: ChartType): void;
}

export interface UseIndicatorsResult extends IndicatorsViewState, IndicatorsActions {
  /** Alias useful when passing the complete derived state to a view. */
  view: IndicatorsViewState;
  /** View-model name used by consumers that keep state separate from actions. */
  viewModel: IndicatorsViewState;
}

const EMPTY_FILTERS: IndicatorFilters = {
  year: null,
  period: null,
  sector: null,
};

const getInitialFilters = (filters?: Partial<IndicatorFilters>): IndicatorFilters => ({
  ...EMPTY_FILTERS,
  ...filters,
});

interface DerivedIndicators {
  options: IndicatorOptions;
  visitorFlow: VisitorFlowPoint[];
  secondaryCards: SecondaryCard[];
  error: Error | null;
}

const EMPTY_DERIVED: DerivedIndicators = {
  options: { years: [], periods: [], sectors: [] },
  visitorFlow: [],
  secondaryCards: [],
  error: null,
};

const calculateIndicators = (
  records: readonly IndicatorRecord[],
  filters: IndicatorFilters,
  metricDefinitions: readonly SecondaryMetricDefinition[],
): DerivedIndicators => {
  const options = getIndicatorOptions(records);
  const filteredRecords = filterIndicators(records, filters);

  return {
    options,
    visitorFlow: aggregateVisitorFlow(filteredRecords),
    secondaryCards: deriveSecondaryCards(filteredRecords, metricDefinitions),
    error: null,
  };
};

export function useIndicators(options: UseIndicatorsOptions = {}): UseIndicatorsResult {
  const explicitRecords = options.records;
  const metricDefinitions = options.metricDefinitions ?? SECONDARY_METRIC_DEFINITIONS;
  const [filters, setFiltersState] = useState<IndicatorFilters>(() =>
    getInitialFilters(options.initialFilters),
  );
  const [chartType, setChartTypeState] = useState<ChartType>(options.initialChartType ?? 'bar');

  // When explicit records are passed, skip API fetch and use them directly.
  const useExplicitRecords = explicitRecords !== undefined;

  // API data state: null = not yet fetched, IndicatorRecord[] = fetched.
  const [apiRecords, setApiRecords] = useState<readonly IndicatorRecord[] | null>(null);
  const [apiStatus, setApiStatus] = useState<IndicatorsStatus>(() =>
    useExplicitRecords ? 'ready' : 'loading',
  );
  const [apiError, setApiError] = useState<Error | null>(null);

  // Fetch records from API (or use mock data) on mount when no explicit records provided.
  useEffect(() => {
    if (useExplicitRecords) return;

    let cancelled = false;

    const resolveRecords = isMockMode()
      ? Promise.resolve(INDICATOR_DATA)
      : listarRegistrosPublicados()
          .then((response) => adaptIndicatorRecords(response.registros))
          .catch((err: unknown) => {
            if (shouldUseFallback()) {
              console.warn(
                '[useIndicators] Falha ao buscar registros da API; usando dados demonstrativos.',
                err,
              );
              return INDICATOR_DATA;
            }
            throw err;
          });

    resolveRecords
      .then((records) => {
        if (cancelled) return;
        setApiRecords(records);
        setApiStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setApiError(err instanceof Error ? err : new Error('Falha ao buscar os indicadores.'));
        setApiStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [useExplicitRecords]);

  // Compute derived indicators synchronously with useMemo.
  const derived = useMemo<DerivedIndicators>(() => {
    if (!useExplicitRecords && apiStatus !== 'ready') {
      return EMPTY_DERIVED;
    }
    const activeRecords = useExplicitRecords ? (explicitRecords ?? []) : (apiRecords ?? []);
    try {
      return calculateIndicators(activeRecords, filters, metricDefinitions);
    } catch (cause: unknown) {
      return {
        ...EMPTY_DERIVED,
        error: cause instanceof Error ? cause : new Error('Falha ao calcular os indicadores.'),
      };
    }
  }, [apiRecords, apiStatus, explicitRecords, filters, metricDefinitions, useExplicitRecords]);

  // Derive status synchronously:
  // - If using explicit records: 'empty' when visitorFlow is empty, else 'ready'.
  // - If fetching from API: reflects apiStatus ('loading' or 'error'); once ready, 'empty' when visitorFlow is empty.
  const status: IndicatorsStatus = useMemo(() => {
    if (useExplicitRecords) {
      if (derived.error) return 'error';
      return derived.visitorFlow.length === 0 ? 'empty' : 'ready';
    }
    if (apiStatus === 'loading') return 'loading';
    if (apiStatus === 'error') return 'error';
    if (derived.error) return 'error';
    return derived.visitorFlow.length === 0 ? 'empty' : 'ready';
  }, [useExplicitRecords, derived.error, derived.visitorFlow.length, apiStatus]);

  const error = useExplicitRecords ? derived.error : (apiError ?? derived.error);

  const updateFilters = useCallback((changes: Partial<IndicatorFilters>) => {
    setFiltersState((prev) => {
      const nextFilters = { ...prev, ...changes };
      if (
        nextFilters.year === prev.year &&
        nextFilters.period === prev.period &&
        nextFilters.sector === prev.sector
      ) {
        return prev;
      }
      return nextFilters;
    });
  }, []);

  const setFilter = useCallback(
    <K extends keyof IndicatorFilters>(filter: K, value: IndicatorFilters[K]) => {
      updateFilters({ [filter]: value });
    },
    [updateFilters],
  );

  const setFilters = useCallback(
    (nextFilters: Partial<IndicatorFilters>) => {
      updateFilters(nextFilters);
    },
    [updateFilters],
  );

  const resetFilters = useCallback(() => {
    updateFilters(EMPTY_FILTERS);
  }, [updateFilters]);

  const setChartType = useCallback((nextChartType: ChartType) => {
    setChartTypeState(nextChartType);
  }, []);

  const view: IndicatorsViewState = {
    filters,
    chartType,
    options: derived.options,
    availableYears: derived.options.years,
    availablePeriods: derived.options.periods,
    availableSectors: derived.options.sectors,
    visitorFlow: status === 'loading' ? [] : derived.visitorFlow,
    secondaryCards: status === 'loading' ? [] : derived.secondaryCards,
    status,
    isLoading: status === 'loading',
    isEmpty: status === 'empty',
    error,
  };

  return {
    ...view,
    setFilter,
    setFilters,
    resetFilters,
    setChartType,
    view,
    viewModel: view,
  };
}
