interface Platform {
  id: string;
  sigla: string;
  nome: string;
  descricao: string;
  passos: readonly string[];
  url: string;
  rotuloLink: string;
  /** Classe de cor (fundo) do ícone, dos passos e do botão. */
  corClass: string;
}

const PLATFORMS: readonly Platform[] = [
  {
    id: 'cadastur',
    sigla: 'C',
    nome: 'Cadastur',
    descricao:
      'Registro obrigatório para meios de hospedagem, agências, guias, transportadoras turísticas e organizadoras de eventos. Gratuito e gerenciado pelo Ministério do Turismo.',
    passos: [
      'Acesse o portal cadastur.turismo.gov.br',
      'Entre com sua conta gov.br',
      'Preencha os dados do estabelecimento',
      'Aguarde a validação do cadastro',
    ],
    url: 'https://cadastur.turismo.gov.br',
    rotuloLink: 'Acessar Cadastur',
    corClass: 'bg-data-sky',
  },
  {
    id: 'fnrh',
    sigla: 'F',
    nome: 'FNRH Digital',
    descricao:
      'Ficha de registro de hóspedes obrigatória para meios de hospedagem. Substituiu o formulário em papel e envia os dados ao sistema do governo federal.',
    passos: [
      'Acesse o portal da FNRH Digital',
      'Cadastre seu estabelecimento',
      'Registre os hóspedes a cada check-in',
      'Mantenha os dados atualizados',
    ],
    url: 'https://fnrh.turismo.gov.br',
    rotuloLink: 'Acessar FNRH Digital',
    corClass: 'bg-brand-purple',
  },
];

export function CadasturPage() {
  return (
    <section aria-labelledby="cadastur-titulo" className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <h1 id="cadastur-titulo" className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Cadastur &amp; FNRH Digital
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          O Cadastro de Prestadores de Serviços Turísticos (Cadastur) e a Ficha Nacional de Registro
          de Hóspedes (FNRH) Digital são plataformas federais obrigatórias para empreendimentos
          turísticos.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {PLATFORMS.map((platform) => (
            <article
              key={platform.id}
              aria-labelledby={`${platform.id}-titulo`}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-white ${platform.corClass}`}
                  aria-hidden="true"
                >
                  {platform.sigla}
                </span>
                <h2 id={`${platform.id}-titulo`} className="text-xl font-bold text-slate-900">
                  {platform.nome}
                </h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{platform.descricao}</p>

              <ol className="mb-6 mt-5 space-y-3">
                {platform.passos.map((passo, index) => (
                  <li key={passo} className="flex items-center gap-3 text-sm text-slate-700">
                    <span
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${platform.corClass}`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    {passo}
                  </li>
                ))}
              </ol>

              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto inline-flex w-full items-center justify-center gap-1 rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 ${platform.corClass}`}
              >
                {platform.rotuloLink} <span aria-hidden="true">↗</span>
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
