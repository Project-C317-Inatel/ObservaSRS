export type ChartType = 'bar' | 'line';

export type IndicatorMetricValue = number | null;

export interface IndicatorRecord {
  period: string;
  year: number;
  sector: string;
  visitors: number;
  secondaryMetrics: Record<string, IndicatorMetricValue>;
}

export interface IndicatorFilters {
  year: number | null;
  period: string | null;
  sector: string | null;
}

export interface VisitorFlowPoint {
  label: string;
  value: number;
}

export type SecondaryMetricAggregation = 'sum' | 'average' | 'min' | 'max';

export interface SecondaryMetricDefinition {
  id: string;
  label: string;
  unit?: string;
  aggregation?: SecondaryMetricAggregation;
}

export interface SecondaryCard {
  id: string;
  label: string;
  value: number | null;
  unit?: string;
}

export interface IndicatorOptions {
  years: number[];
  periods: string[];
  sectors: string[];
}

export interface IndicatorViewModel {
  filters: IndicatorFilters;
  chartType: ChartType;
  availableYears: number[];
  availablePeriods: string[];
  availableSectors: string[];
  visitorFlow: VisitorFlowPoint[];
  secondaryCards: SecondaryCard[];
}
