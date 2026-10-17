import { describe, expect, it } from 'vitest';
import { INDICATOR_DATA, SECONDARY_METRIC_DEFINITIONS } from './data';
import {
  aggregateVisitorFlow,
  deriveSecondaryCards,
  filterIndicators,
  getIndicatorOptions,
} from './logic';
import type { IndicatorFilters, IndicatorRecord } from '../../types/indicators';

const noFilters: IndicatorFilters = { year: null, period: null, sector: null };

describe('lógica dos indicadores', () => {
  it('filtra por ano, período e setor de forma combinável sem mutar a fonte', () => {
    const source = [...INDICATOR_DATA];
    const result = filterIndicators(source, {
      year: 2026,
      period: '2026-02',
      sector: 'Hotelaria',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.visitors).toBe(1640);
    expect(source).toEqual(INDICATOR_DATA);
  });

  it('retorna resultado vazio quando não há correspondências', () => {
    expect(filterIndicators(INDICATOR_DATA, { ...noFilters, year: 2030 })).toEqual([]);
  });

  it('obtém opções únicas e ordenadas', () => {
    expect(getIndicatorOptions(INDICATOR_DATA)).toEqual({
      years: [2025, 2026],
      periods: ['2025-01', '2025-02', '2026-01', '2026-02'],
      sectors: ['Atrativos turísticos', 'Hotelaria'],
    });
  });

  it('agrega visitantes por período em ordem temporal', () => {
    const records = [
      { ...INDICATOR_DATA[4]!, period: '2026-02' },
      { ...INDICATOR_DATA[0]!, period: '2025-01' },
      { ...INDICATOR_DATA[5]!, period: '2026-02' },
    ];
    expect(aggregateVisitorFlow(records)).toEqual([
      { label: '2025-01', value: 1240 },
      { label: '2026-02', value: 3150 },
    ]);
  });

  it('deriva cards com soma, média e nulo quando não há valores', () => {
    const records: IndicatorRecord[] = [
      {
        period: '2026-01',
        year: 2026,
        sector: 'Hotelaria',
        visitors: 1,
        secondaryMetrics: { total: 10, rate: 20, missing: null },
      },
      {
        period: '2026-02',
        year: 2026,
        sector: 'Hotelaria',
        visitors: 1,
        secondaryMetrics: { total: 5, rate: 40, missing: null },
      },
    ];
    expect(
      deriveSecondaryCards(records, [
        { id: 'total', label: 'Total', aggregation: 'sum' },
        { id: 'rate', label: 'Taxa', unit: '%', aggregation: 'average' },
        { id: 'missing', label: 'Ausente', aggregation: 'sum' },
      ]),
    ).toEqual([
      { id: 'total', label: 'Total', unit: undefined, value: 15 },
      { id: 'rate', label: 'Taxa', unit: '%', value: 30 },
      { id: 'missing', label: 'Ausente', unit: undefined, value: null },
    ]);
  });

  it('usa os dados demonstrativos para calcular cards da tela', () => {
    const cards = deriveSecondaryCards(
      filterIndicators(INDICATOR_DATA, { ...noFilters, year: 2026, sector: 'Hotelaria' }),
      SECONDARY_METRIC_DEFINITIONS,
    );
    expect(cards.map(({ id, value }) => ({ id, value }))).toEqual([
      { id: 'overnightStays', value: 2130 },
      { id: 'occupancyRate', value: 76.5 },
      { id: 'averageStay', value: 2.6500000000000004 },
    ]);
  });
});
