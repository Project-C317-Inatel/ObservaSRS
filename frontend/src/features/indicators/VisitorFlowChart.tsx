import type { ChartType, VisitorFlowPoint } from '../../types/indicators';
import { formatPeriod } from './format';

export interface VisitorFlowChartProps {
  data: readonly VisitorFlowPoint[];
  chartType: ChartType;
}

const chartWidth = 720;
const chartHeight = 280;
const padding = { top: 24, right: 20, bottom: 54, left: 58 };

export function VisitorFlowChart({ data, chartType }: VisitorFlowChartProps) {
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const x = (index: number) =>
    padding.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
  const y = (value: number) => padding.top + plotHeight - (value / maxValue) * plotHeight;
  const points = data.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
  const numberFormat = new Intl.NumberFormat('pt-BR');

  if (data.length === 0) return null;

  return (
    <div
      className="overflow-x-auto"
      role="img"
      aria-label="Gráfico do fluxo de visitantes por período"
    >
      <svg
        className="h-auto min-w-[34rem] w-full"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        aria-labelledby="fluxo-grafico-titulo fluxo-grafico-descricao"
        role="img"
      >
        <title id="fluxo-grafico-titulo">Fluxo de visitantes</title>
        <desc id="fluxo-grafico-descricao">
          {data
            .map((point) => `${formatPeriod(point.label)}: ${numberFormat.format(point.value)}`)
            .join('; ')}
        </desc>
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={padding.left + plotWidth}
          y2={padding.top + plotHeight}
          stroke="#cbd5e1"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="#cbd5e1"
        />
        {[0, 0.5, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={padding.left}
              y1={padding.top + plotHeight * (1 - ratio)}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight * (1 - ratio)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={padding.top + plotHeight * (1 - ratio) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[11px]"
            >
              {numberFormat.format(Math.round(maxValue * ratio))}
            </text>
          </g>
        ))}
        {chartType === 'bar'
          ? data.map((point, index) => {
              const barWidth = Math.min(54, Math.max(18, plotWidth / data.length - 18));
              return (
                <rect
                  key={point.label}
                  x={x(index) - barWidth / 2}
                  y={y(point.value)}
                  width={barWidth}
                  height={padding.top + plotHeight - y(point.value)}
                  rx="5"
                  className="fill-brand-purple transition-opacity hover:opacity-80"
                >
                  <title>{`${formatPeriod(point.label)}: ${numberFormat.format(point.value)} visitantes`}</title>
                </rect>
              );
            })
          : null}
        {chartType === 'line' ? (
          <>
            <polyline points={points} fill="none" stroke="#6c5ce0" strokeWidth="4" />
            {data.map((point, index) => (
              <circle
                key={point.label}
                cx={x(index)}
                cy={y(point.value)}
                r="6"
                className="fill-brand-purple"
              >
                <title>{`${formatPeriod(point.label)}: ${numberFormat.format(point.value)} visitantes`}</title>
              </circle>
            ))}
          </>
        ) : null}
        {data.map((point, index) => (
          <text
            key={`label-${point.label}`}
            x={x(index)}
            y={chartHeight - 20}
            textAnchor="middle"
            className="fill-slate-600 text-[11px]"
          >
            {formatPeriod(point.label)}
          </text>
        ))}
      </svg>
    </div>
  );
}
