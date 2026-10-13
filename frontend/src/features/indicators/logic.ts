import type {
  IndicatorFilters,
  IndicatorOptions,
  IndicatorRecord,
  SecondaryCard,
  SecondaryMetricDefinition,
  VisitorFlowPoint,
} from '../../types/indicators';

const periodParts = (period: string): [number, number] | null => {
  const match = /^(\d{4})-(\d{1,2})$/.exec(period);
  if (match) return [Number(match[1]), Number(match[2])];

  const quarter = /^(\d{4})-T([1-4])$/i.exec(period);
  return quarter ? [Number(quarter[1]), Number(quarter[2]) * 3] : null;
};

const comparePeriods = (left: string, right: string): number => {
  const leftParts = periodParts(left);
  const rightParts = periodParts(right);
  if (leftParts && rightParts) return leftParts[0] - rightParts[0] || leftParts[1] - rightParts[1];
  return left.localeCompare(right, 'pt-BR');
};

export const isValidIndicatorRecord = (record: IndicatorRecord): boolean =>
  record.period.trim().length > 0 &&
  Number.isInteger(record.year) &&
  record.sector.trim().length > 0 &&
  Number.isFinite(record.visitors);

export const filterIndicators = (
  records: readonly IndicatorRecord[],
  filters: IndicatorFilters,
): IndicatorRecord[] =>
  records.filter(
    (record) =>
      isValidIndicatorRecord(record) &&
      (filters.year === null || record.year === filters.year) &&
      (filters.period === null || record.period === filters.period) &&
      (filters.sector === null || record.sector === filters.sector),
  );

export const getIndicatorOptions = (records: readonly IndicatorRecord[]): IndicatorOptions => {
  const validRecords = records.filter(isValidIndicatorRecord);
  return {
    years: [...new Set(validRecords.map((record) => record.year))].sort((a, b) => a - b),
    periods: [...new Set(validRecords.map((record) => record.period))].sort(comparePeriods),
    sectors: [...new Set(validRecords.map((record) => record.sector))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    ),
  };
};

export const aggregateVisitorFlow = (records: readonly IndicatorRecord[]): VisitorFlowPoint[] => {
  const totals = new Map<string, number>();
  for (const record of records.filter(isValidIndicatorRecord)) {
    totals.set(record.period, (totals.get(record.period) ?? 0) + record.visitors);
  }
  return [...totals.entries()]
    .sort(([left], [right]) => comparePeriods(left, right))
    .map(([label, value]) => ({ label, value }));
};

const aggregateValues = (
  values: number[],
  aggregation: NonNullable<SecondaryMetricDefinition['aggregation']>,
): number | null => {
  if (values.length === 0) return null;
  if (aggregation === 'sum') return values.reduce((total, value) => total + value, 0);
  if (aggregation === 'min') return Math.min(...values);
  if (aggregation === 'max') return Math.max(...values);
  return values.reduce((total, value) => total + value, 0) / values.length;
};

export const deriveSecondaryCards = (
  records: readonly IndicatorRecord[],
  definitions: readonly SecondaryMetricDefinition[],
): SecondaryCard[] =>
  definitions.map((definition) => ({
    id: definition.id,
    label: definition.label,
    unit: definition.unit,
    value: aggregateValues(
      records
        .filter(isValidIndicatorRecord)
        .map((record) => record.secondaryMetrics[definition.id])
        .filter((value): value is number => value !== null && Number.isFinite(value)),
      definition.aggregation ?? 'sum',
    ),
  }));
