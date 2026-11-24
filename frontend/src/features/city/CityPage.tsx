import fotoCidade from '../../assets/photos/banner.webp';
import fotoCCCF from '../../assets/photos/cccf.webp';

import {
  CCCF_CLOSING,
  CCCF_INITIATIVES,
  CCCF_RECOGNITION,
  CCCF_SUBTITLE,
  CCCF_TEXT,
  CITY_CLOSING,
  CITY_MILESTONES,
  CITY_TEXT,
} from './content';

/** Uma cor da identidade da cidade para cada card de iniciativa do CCCF. */
const INITIATIVE_COLORS = [
  'border-city-red',
  'border-city-orange',
  'border-city-teal',
  'border-brand-purple',
] as const;

export function CityPage() {
  return (
    <div className="font-body">
      <section
        aria-labelledby="cidade-titulo"
        className="bg-surface-cream px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto w-full max-w-7xl">
          <img
            src={fotoCidade}
            alt="Parede com pintura de grafite, com o fundo azul e a frase 'Santa Rita do Sapucaí' escrita em letras brancas e roxas. A imagem também mostra um ciclista."
            className="mb-8 h-auto w-full rounded-2xl"
          />
          <p className="inline-block rounded-full bg-data-yellow px-5 py-1.5 font-hand text-xl font-bold text-brand-purple sm:text-2xl">
            Nossa cidade, nossa história
          </p>
          <h1
            id="cidade-titulo"
            className="mt-5 bg-title-gradient bg-clip-text font-display text-4xl leading-tight text-transparent uppercase sm:text-5xl"
          >
            Conheça Santa Rita do Sapucaí
          </h1>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4 leading-relaxed text-text-earth">
              {CITY_TEXT.map((paragrafo) => (
                <p key={paragrafo.slice(0, 40)}>{paragrafo}</p>
              ))}
              <p className="font-hand text-2xl font-bold text-brand-purple">{CITY_CLOSING}</p>
            </div>

            <aside aria-labelledby="marcos-titulo">
              <h2 id="marcos-titulo" className="font-display text-2xl text-slate-900 uppercase">
                Linha do tempo
              </h2>
              <ol className="mt-4 border-l-2 border-brand-purple/30">
                {CITY_MILESTONES.map((marco) => (
                  <li key={marco.ano} className="relative mb-5 pl-6 last:mb-0">
                    <span
                      className="absolute top-1.5 -left-[7px] h-3 w-3 rounded-full bg-brand-purple"
                      aria-hidden="true"
                    />
                    <p className="font-display text-lg text-brand-purple">{marco.ano}</p>
                    <p className="text-sm text-text-soft">{marco.texto}</p>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      <section aria-labelledby="cccf-titulo" className="bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <img
            src={fotoCCCF}
            alt="Parece com pintura de grafite, com o fundo azul e a frase 'Cidade Criativa, Cidade Feliz' escrita em letras brancas e roxas. A imagem também mostra uma banda de música."
            className="mb-8 h-56 w-full rounded-2xl object-cover sm:h-80"
          />
          <h2
            id="cccf-titulo"
            className="font-display text-3xl leading-tight text-slate-900 uppercase sm:text-4xl"
          >
            Cidade criativa, cidade feliz
          </h2>
          <p className="mt-2 font-hand text-2xl text-brand-purple">{CCCF_SUBTITLE}</p>

          <div className="mt-6 max-w-4xl space-y-4 leading-relaxed text-slate-700">
            {CCCF_TEXT.map((paragrafo) => (
              <p key={paragrafo.slice(0, 40)}>{paragrafo}</p>
            ))}
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CCCF_INITIATIVES.map((iniciativa, index) => (
              <li
                key={iniciativa.nome}
                className={`rounded-2xl border-t-4 bg-slate-50 p-5 shadow-sm ${INITIATIVE_COLORS[index % INITIATIVE_COLORS.length]}`}
              >
                <h3 className="font-bold text-slate-900">{iniciativa.nome}</h3>
                <p className="mt-2 text-sm text-slate-600">{iniciativa.descricao}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-4xl leading-relaxed text-slate-700">{CCCF_RECOGNITION}</p>
          <blockquote className="mt-6 max-w-4xl border-l-4 border-brand-magenta pl-5 font-hand text-2xl font-bold text-slate-800 sm:text-3xl">
            {CCCF_CLOSING}
          </blockquote>
        </div>
      </section>
    </div>
  );
}