import { useCallback, useEffect, useRef, useState } from 'react';

import { INDICATOR_DATA, SECONDARY_METRIC_DEFINITIONS } from './data';
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
  const records = options.records ?? INDICATOR_DATA;
  const metricDefinitions = options.metricDefinitions ?? SECONDARY_METRIC_DEFINITIONS;
  const [filters, setFiltersState] = useState<IndicatorFilters>(() =>
    getInitialFilters(options.initialFilters),
  );
  const [chartType, setChartTypeState] = useState<ChartType>(options.initialChartType ?? 'bar');
  const [derived, setDerived] = useState<DerivedIndicators>(() => {
    try {
      return calculateIndicators(
        records,
        getInitialFilters(options.initialFilters),
        metricDefinitions,
      );
    } catch (cause: unknown) {
      return {
        options: { years: [], periods: [], sectors: [] },
        visitorFlow: [],
        secondaryCards: [],
        error: cause instanceof Error ? cause : new Error('Falha ao calcular os indicadores.'),
      };
    }
  });
  const [status, setStatus] = useState<IndicatorsStatus>(() => {
    try {
      return calculateIndicators(
        records,
        getInitialFilters(options.initialFilters),
        metricDefinitions,
      ).visitorFlow.length === 0
        ? 'empty'
        : 'ready';
    } catch {
      return 'error';
    }
  });
  const calculationId = useRef(0);
  const isInitialRender = useRef(true);
  const filtersRef = useRef(filters);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const currentCalculation = ++calculationId.current;
    let cancelled = false;

    // Defer local synchronous derivation so the loading state has a distinct render.
    queueMicrotask(() => {
      if (cancelled || currentCalculation !== calculationId.current) return;

      try {
        const nextDerived = calculateIndicators(records, filters, metricDefinitions);
        setDerived(nextDerived);
        setStatus(
          nextDerived.error ? 'error' : nextDerived.visitorFlow.length === 0 ? 'empty' : 'ready',
        );
      } catch (cause: unknown) {
        setDerived({
          options: { years: [], periods: [], sectors: [] },
          visitorFlow: [],
          secondaryCards: [],
          error: cause instanceof Error ? cause : new Error('Falha ao calcular os indicadores.'),
        });
        setStatus('error');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [filters, metricDefinitions, records]);

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
    setStatus('loading');
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
