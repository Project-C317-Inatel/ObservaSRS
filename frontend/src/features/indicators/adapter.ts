import type { RegistroIndicador } from '../../types/api';
import type { IndicatorMetricValue, IndicatorRecord } from '../../types/indicators';
import { codigoVisual } from '../../shared/metricas';

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
  const metricasRecebidas = new Set<string>();

  for (const registro of registros) {
    const period = registro.periodo;
    const sector = registro.indicador.setor.nome;
    const codigo = codigoVisual(registro.indicador.nome);
    const groupKey = `${period}__${sector}`;
    const metricKey = `${period}__${registro.indicador.setorId}__${codigo}`;
    if (metricasRecebidas.has(metricKey)) {
      throw new Error(
        'Existem valores de fontes ou indicadores diferentes para a mesma metrica, setor e periodo. Defina a fonte antes de consolidar o grafico.',
      );
    }
    metricasRecebidas.add(metricKey);

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

    if (codigo === 'visitantes') {
      record.visitors = numericValue ?? 0;
    } else {
      const secondaryKey = METRIC_CODE_TO_SECONDARY_KEY[codigo] ?? codigo;
      record.secondaryMetrics[secondaryKey] = numericValue;
    }
  }

  return Array.from(groups.values());
};

export const adaptarRegistrosIndicadores = adaptIndicatorRecords;
