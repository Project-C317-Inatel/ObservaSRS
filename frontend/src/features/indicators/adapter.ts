import type { RegistroIndicador } from '../../types/api';
import type { IndicatorMetricValue, IndicatorRecord } from '../../types/indicators';

const METRIC_CODE_TO_SECONDARY_KEY: Record<string, string> = {
  pernoites: 'overnightStays',
  taxa_ocupacao: 'occupancyRate',
  estada_media: 'averageStay',
};

const parseNumeric = (valor: string): number | null => {
  if (typeof valor !== 'string') return null;
  const trimmed = valor.trim().replace(',', '.');
  if (trimmed === '') return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
};

const extractYear = (period: string): number => {
  const match = /^(\d{4})/.exec(period.trim());
  if (match?.[1]) {
    return Number.parseInt(match[1], 10);
  }
  const parsed = Number.parseInt(period, 10);
  return Number.isInteger(parsed) ? parsed : 0;
};

export const adaptIndicatorRecords = (
  registros: readonly RegistroIndicador[],
): IndicatorRecord[] => {
  const groups = new Map<
    string,
    {
      period: string;
      year: number;
      sector: string;
      visitors: number;
      secondaryMetrics: Record<string, IndicatorMetricValue>;
    }
  >();

  for (const registro of registros) {
    const period = registro.periodo;
    const sector = registro.setorNome;
    const groupKey = `${period}__${sector}`;

    let record = groups.get(groupKey);
    if (!record) {
      record = {
        period,
        year: extractYear(period),
        sector,
        visitors: 0,
        secondaryMetrics: {
          overnightStays: null,
          occupancyRate: null,
          averageStay: null,
        },
      };
      groups.set(groupKey, record);
    }

    const numericValue = parseNumeric(registro.valor);

    if (registro.indicadorCodigo === 'visitantes') {
      record.visitors = numericValue ?? 0;
    } else {
      const secondaryKey =
        METRIC_CODE_TO_SECONDARY_KEY[registro.indicadorCodigo] ?? registro.indicadorCodigo;
      record.secondaryMetrics[secondaryKey] = numericValue;
    }
  }

  return Array.from(groups.values());
};

export const adaptarRegistrosIndicadores = adaptIndicatorRecords;
