import { CITY_PHOTOS } from './photos';

/**
 * No celular, cada foto tem proporção fixa. A partir de lg, o mosaico estica até a altura
 * do texto ao lado e as fotos preenchem as linhas do grid.
 */
const cellClass = 'relative overflow-hidden lg:aspect-auto';
const photoClass = 'absolute inset-0 h-full w-full object-cover';

/** Mosaico de fotos da cidade: uma larga em cima, uma alta à esquerda e duas à direita. */
export function CityPhotoMosaic() {
  const { casario, igreja, armazem, predioVermelho } = CITY_PHOTOS;

  return (
    <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl lg:h-full lg:grid-rows-[3fr_2fr_2fr]">
      <div className={`col-span-2 aspect-video ${cellClass}`}>
        <img src={casario.src} alt={casario.alt} className={photoClass} />
      </div>
      <div className={`row-span-2 ${cellClass}`}>
        <img src={igreja.src} alt={igreja.alt} className={photoClass} />
      </div>
      <div className={`aspect-4/3 ${cellClass}`}>
        <img src={armazem.src} alt={armazem.alt} className={photoClass} />
      </div>
      <div className={`aspect-4/3 ${cellClass}`}>
        <img src={predioVermelho.src} alt={predioVermelho.alt} className={photoClass} />
      </div>
    </div>
  );
}
