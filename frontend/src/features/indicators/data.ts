import type { IndicatorRecord, SecondaryMetricDefinition } from '../../types/indicators';

export const INDICATOR_DATA = [
  {
    period: '2025-01',
    year: 2025,
    sector: 'Hotelaria',
    visitors: 1240,
    secondaryMetrics: { overnightStays: 860, occupancyRate: 68, averageStay: 2.4 },
  },
  {
    period: '2025-02',
    year: 2025,
    sector: 'Hotelaria',
    visitors: 1380,
    secondaryMetrics: { overnightStays: 940, occupancyRate: 72, averageStay: 2.5 },
  },
  {
    period: '2025-01',
    year: 2025,
    sector: 'Atrativos turísticos',
    visitors: 980,
    secondaryMetrics: { overnightStays: null, occupancyRate: null, averageStay: null },
  },
  {
    period: '2025-02',
    year: 2025,
    sector: 'Atrativos turísticos',
    visitors: 1120,
    secondaryMetrics: { overnightStays: null, occupancyRate: null, averageStay: null },
  },
  {
    period: '2026-01',
    year: 2026,
    sector: 'Hotelaria',
    visitors: 1510,
    secondaryMetrics: { overnightStays: 1020, occupancyRate: 75, averageStay: 2.6 },
  },
  {
    period: '2026-02',
    year: 2026,
    sector: 'Hotelaria',
    visitors: 1640,
    secondaryMetrics: { overnightStays: 1110, occupancyRate: 78, averageStay: 2.7 },
  },
  {
    period: '2026-01',
    year: 2026,
    sector: 'Atrativos turísticos',
    visitors: 1260,
    secondaryMetrics: { overnightStays: null, occupancyRate: null, averageStay: null },
  },
  {
    period: '2026-02',
    year: 2026,
    sector: 'Atrativos turísticos',
    visitors: 1340,
    secondaryMetrics: { overnightStays: null, occupancyRate: null, averageStay: null },
  },
] satisfies readonly IndicatorRecord[];

export const SECONDARY_METRIC_DEFINITIONS = [
  { id: 'overnightStays', label: 'Pernoites', unit: 'noites', aggregation: 'sum' },
  { id: 'occupancyRate', label: 'Taxa de ocupação', unit: '%', aggregation: 'average' },
  { id: 'averageStay', label: 'Estada média', unit: 'noites', aggregation: 'average' },
] satisfies readonly SecondaryMetricDefinition[];
