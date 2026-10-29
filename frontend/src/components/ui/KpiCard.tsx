export interface KpiCardProps {
  label: string;
  value: number;
  caption?: string;
  icon: string;
  /** Classe Tailwind do fundo do ícone (ex.: bg-data-sky). */
  iconClass: string;
}

const numberFormat = new Intl.NumberFormat('pt-BR');

export function KpiCard({ label, value, caption, icon, iconClass }: KpiCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 text-slate-900 shadow-lg">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
        <img src={icon} alt="" className="h-6 w-6" />
      </span>
      <p className="mt-4 text-3xl font-extrabold">{numberFormat.format(value)}</p>
      <h3 className="mt-1 font-semibold text-slate-800">{label}</h3>
      {caption ? <p className="mt-1 text-sm text-slate-500">{caption}</p> : null}
    </article>
  );
}
