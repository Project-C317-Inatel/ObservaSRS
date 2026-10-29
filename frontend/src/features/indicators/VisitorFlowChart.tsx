import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartType, VisitorFlowPoint } from '../../types/indicators';
import { formatPeriod } from './format';

export interface VisitorFlowChartProps {
  data: readonly VisitorFlowPoint[];
  chartType: ChartType;
}

const numberFormat = new Intl.NumberFormat('pt-BR');

/** Cores do tema (index.css). O SVG do Recharts precisa do valor direto. */
const COR_PRINCIPAL = '#6c5ce0'; // brand-purple
const COR_GRADE = '#e2e8f0'; // slate-200
const COR_TEXTO = '#475569'; // slate-600

const formatarNumero = (valor: number) => numberFormat.format(valor);

export function VisitorFlowChart({ data, chartType }: VisitorFlowChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((point) => ({
    periodo: formatPeriod(point.label),
    visitantes: point.value,
  }));

  const resumo = chartData
    .map((item) => `${item.periodo}: ${formatarNumero(item.visitantes)}`)
    .join('; ');

  return (
    <div
      className="mt-6 h-72 w-full"
      role="img"
      aria-label={`Gráfico do fluxo de visitantes por período. ${resumo}`}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 720, height: 288 }}
      >
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid stroke={COR_GRADE} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="periodo" tick={{ fill: COR_TEXTO, fontSize: 12 }} />
            <YAxis
              tickFormatter={formatarNumero}
              tick={{ fill: COR_TEXTO, fontSize: 12 }}
              width={56}
            />
            <Tooltip formatter={(valor) => formatarNumero(Number(valor))} />
            <Bar
              dataKey="visitantes"
              name="Visitantes"
              fill={COR_PRINCIPAL}
              radius={[6, 6, 0, 0]}
              maxBarSize={54}
            />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid stroke={COR_GRADE} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="periodo" tick={{ fill: COR_TEXTO, fontSize: 12 }} />
            <YAxis
              tickFormatter={formatarNumero}
              tick={{ fill: COR_TEXTO, fontSize: 12 }}
              width={56}
            />
            <Tooltip formatter={(valor) => formatarNumero(Number(valor))} />
            <Line
              type="monotone"
              dataKey="visitantes"
              name="Visitantes"
              stroke={COR_PRINCIPAL}
              strokeWidth={3}
              dot={{ r: 5, fill: COR_PRINCIPAL }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
