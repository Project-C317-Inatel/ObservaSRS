import { Logo } from '../ui/Logo';

const GESTAO_MUNICIPAL = [
  'Prefeitura de Santa Rita do Sapucaí',
  'SMCELT — Secretaria de Cultura, Esporte, Lazer e Turismo',
  'COMTUR — Conselho Municipal de Turismo',
];

const CIRCUITOS = [
  'Circuito Caminhos da Mantiqueira',
  'Secretaria de Estado de Turismo — Minas Gerais',
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 text-center sm:px-6 md:grid-cols-3">
        <div className="flex flex-col items-center gap-3">
          <Logo variant="clara" className="h-12 w-auto" />
          <p className="max-w-xs text-sm leading-relaxed">
            Observatório de cultura, lazer, esporte e turismo de Santa Rita do Sapucaí
          </p>
        </div>

        <FooterColumn title="Gestão municipal" items={GESTAO_MUNICIPAL} />
        <FooterColumn title="Circuitos & parcerias" items={CIRCUITOS} />
      </div>

      <div className="border-t border-slate-800">
        <p className="mx-auto w-full max-w-7xl px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
          © {year} Observatório do Turismo de Santa Rita do Sapucaí. Dados abertos.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
