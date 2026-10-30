import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts';

import { COMPANIES_BY_SECTOR, totalCompanies, type CompaniesBySector } from './data';

export interface CompaniesBySectorChartProps {
  data?: readonly CompaniesBySector[];
}

const numberFormat = new Intl.NumberFormat('pt-BR');

/** Paleta de dados do tema (index.css). O SVG do Recharts precisa do valor direto. */
const CORES = [
  '#6c5ce0', // brand-purple
  '#27b7fd', // data-sky
  '#5fe6e0', // data-cyan
  '#b986ed', // data-lilac
  '#f3b8f7', // data-lilac-light
  '#fada77', // data-yellow
];
const COR_GRADE = '#e2e8f0'; // slate-200
const COR_TEXTO = '#475569'; // slate-600

export function CompaniesBySectorChart({
  data = COMPANIES_BY_SECTOR,
}: CompaniesBySectorChartProps) {
  const resumo = data
    .map((item) => `${item.setor}: ${numberFormat.format(item.quantidade)}`)
    .join('; ');

  return (
    <section
      aria-labelledby="empresas-setor-titulo"
      className="bg-slate-50 px-4 pb-10 sm:px-6 sm:pb-14"
    >
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 id="empresas-setor-titulo" className="text-lg font-semibold text-slate-900">
          Empresas por setor
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {numberFormat.format(totalCompanies(data))} empresas com Cadastur ativo.
        </p>

        {data.length === 0 ? (
          <p className="mt-6 text-center text-slate-600">Nenhuma empresa cadastrada.</p>
        ) : (
          <div
            className="mt-6 h-80 w-full"
            role="img"
            aria-label={`Gráfico de empresas por setor. ${resumo}`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 720, height: 320 }}
            >
              <BarChart
                data={[...data]}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke={COR_GRADE} strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tick={{ fill: COR_TEXTO, fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="setor"
                  tick={{ fill: COR_TEXTO, fontSize: 12 }}
                  width={110}
                />
                <Tooltip formatter={(valor) => numberFormat.format(Number(valor))} />
                <Bar
                  dataKey="quantidade"
                  name="Empresas"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={32}
                  shape={(props: BarShapeProps) => (
                    <Rectangle {...props} fill={CORES[props.index % CORES.length]} />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
