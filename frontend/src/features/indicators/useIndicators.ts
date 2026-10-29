import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [apiRecords, setApiRecords] = useState<readonly IndicatorRecord[] | null>(
    useExplicitRecords ? explicitRecords : null,
  );
  const [status, setStatus] = useState<IndicatorsStatus>(() => {
    if (useExplicitRecords) {
      try {
        const d = calculateIndicators(
          explicitRecords,
          getInitialFilters(options.initialFilters),
          metricDefinitions,
        );
        return d.visitorFlow.length === 0 ? 'empty' : 'ready';
      } catch {
        return 'error';
      }
    }
    // If mock mode, initialise as ready (will be set after first effect).
    return 'loading';
  });

  const [derived, setDerived] = useState<DerivedIndicators>(() => {
    if (useExplicitRecords) {
      try {
        return calculateIndicators(
          explicitRecords,
          getInitialFilters(options.initialFilters),
          metricDefinitions,
        );
      } catch (cause: unknown) {
        return {
          ...EMPTY_DERIVED,
          error: cause instanceof Error ? cause : new Error('Falha ao calcular os indicadores.'),
        };
      }
    }
    return EMPTY_DERIVED;
  });

  const calculationId = useRef(0);
  const filtersRef = useRef(filters);
  // Set to true when the API fetch fails fatally (production, no fallback).
  // Prevents the derivation effect from overwriting the error status.
  const fetchFailed = useRef(false);

  const isFirstDerivation = useRef(true);

  // Step 1: fetch records from API (or use mock data) on mount when no explicit records provided.
  // Step 2: derive indicators whenever records or filters change.
  // Both steps are merged: fetch resolves into apiRecords; the derivation effect runs on apiRecords.
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
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        fetchFailed.current = true;
        setDerived({
          ...EMPTY_DERIVED,
          error: err instanceof Error ? err : new Error('Falha ao buscar os indicadores.'),
        });
        setStatus('error');
        // Trigger the derivation effect guard by setting an empty array,
        // but fetchFailed.current will prevent it from overwriting the error.
        setApiRecords([]);
      });

    return () => {
      cancelled = true;
    };
  }, [useExplicitRecords]);

  // Derive indicators whenever records or filters change.
  useEffect(() => {
    const activeRecords = useExplicitRecords ? (explicitRecords ?? []) : (apiRecords ?? []);
    const recordsReady = useExplicitRecords || apiRecords !== null;

    if (!recordsReady) return;

    // If the fetch failed fatally, do not overwrite the error status with derivation.
    if (fetchFailed.current) return;

    // Skip setting loading on the very first derivation (initial render already set status).
    const isFirst = isFirstDerivation.current;
    isFirstDerivation.current = false;

    if (!isFirst) {
      setStatus('loading');
    }

    const currentCalculation = ++calculationId.current;

    queueMicrotask(() => {
      if (currentCalculation !== calculationId.current) return;

      try {
        const nextDerived = calculateIndicators(activeRecords, filters, metricDefinitions);
        setDerived(nextDerived);
        setStatus(nextDerived.visitorFlow.length === 0 ? 'empty' : 'ready');
      } catch (cause: unknown) {
        setDerived({
          ...EMPTY_DERIVED,
          error: cause instanceof Error ? cause : new Error('Falha ao calcular os indicadores.'),
        });
        setStatus('error');
      }
    });
  }, [apiRecords, explicitRecords, filters, metricDefinitions, useExplicitRecords]);

  const updateFilters = useCallback((changes: Partial<IndicatorFilters>) => {
    const nextFilters = { ...filtersRef.current, ...changes };
    if (
      nextFilters.year === filtersRef.current.year &&
      nextFilters.period === filtersRef.current.period &&
      nextFilters.sector === filtersRef.current.sector
    ) {
      return;
    }
    filtersRef.current = nextFilters;
    setFiltersState(nextFilters);
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
    error: derived.error,
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
