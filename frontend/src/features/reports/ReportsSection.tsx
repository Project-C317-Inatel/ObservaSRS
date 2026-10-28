import { PUBLIC_REPORTS, formatReportDate, type PublicReport } from './data';

export interface ReportsSectionProps {
  reports?: readonly PublicReport[];
}

const downloadClass =
  'mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition';

export function ReportsSection({ reports = PUBLIC_REPORTS }: ReportsSectionProps) {
  return (
    <section
      id="relatorios"
      aria-labelledby="relatorios-titulo"
      className="scroll-mt-20 bg-white px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <h2 id="relatorios-titulo" className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Relatórios públicos
        </h2>
        <p className="mt-1 text-slate-500">Downloads disponíveis em PDF</p>

        {reports.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
            Nenhum relatório publicado até o momento.
          </p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-brand-magenta/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-brand-magenta">
                    {report.tipo}
                  </span>
                  <time className="text-xs text-slate-500" dateTime={report.publicadoEm}>
                    {formatReportDate(report.publicadoEm)}
                  </time>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{report.titulo}</h3>
                <p className="mb-5 mt-2 text-sm text-slate-600">{report.descricao}</p>

                {report.arquivoUrl ? (
                  <a
                    className={`${downloadClass} bg-brand-gradient text-white hover:brightness-110`}
                    href={report.arquivoUrl}
                    download
                  >
                    <span aria-hidden="true">↓</span> Baixar PDF
                  </a>
                ) : (
                  <span
                    className={`${downloadClass} cursor-not-allowed bg-slate-200 text-slate-500`}
                    aria-disabled="true"
                    title="O arquivo ainda não foi publicado pela SMCELT"
                  >
                    <span aria-hidden="true">↓</span> PDF em breve
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
