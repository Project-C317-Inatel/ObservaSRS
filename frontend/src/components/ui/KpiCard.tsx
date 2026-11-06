export interface KpiCardProps {
  label: string;
  value: number;
  caption?: string;
  icon: string;
  /** Classe Tailwind da cor do topo do marcador (ex.: bg-brand-purple). */
  iconClass: string;
}

const numberFormat = new Intl.NumberFormat('pt-BR');

export function KpiCard({ label, value, caption, icon, iconClass }: KpiCardProps) {
  return (
    <article className="flex h-full flex-col text-center font-body">
      <div className={`relative flex h-24 items-center justify-center rounded-t-xl ${iconClass}`}>
        <img src={icon} alt="" className="relative z-10 size-14" />
        <span
          className={`absolute -bottom-4 left-1/2 size-8 -translate-x-1/2 rotate-45 ${iconClass}`}
          aria-hidden="true"
        />
      </div>
      <div className="mx-2 flex flex-1 flex-col items-center rounded-b-xl bg-white px-3 pt-7 pb-4 shadow-sm">
        <p className="text-2xl font-semibold text-slate-900">{numberFormat.format(value)}</p>
        <h3 className="mt-1 text-sm font-medium text-slate-700">{label}</h3>
        {caption ? <p className="mt-1 text-xs text-slate-500">{caption}</p> : null}
      </div>
    </article>
  );
}