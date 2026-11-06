import { CITY_PHOTOS } from './photos';

const photoClass = 'h-full w-full object-cover';

/** Mosaico de fotos da cidade: uma larga em cima, uma alta à esquerda e duas à direita. */
export function CityPhotoMosaic() {
  const { casario, igreja, armazem, predioVermelho } = CITY_PHOTOS;

  return (
    <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
      <img
        src={casario.src}
        alt={casario.alt}
        className={`col-span-2 aspect-video ${photoClass}`}
      />

      {/* A foto alta fica "solta" (absolute) para não esticar as linhas do grid */}
      <div className="relative row-span-2">
        <img src={igreja.src} alt={igreja.alt} className={`absolute inset-0 ${photoClass}`} />
      </div>

      <img src={armazem.src} alt={armazem.alt} className={`aspect-4/3 ${photoClass}`} />
      <img
        src={predioVermelho.src}
        alt={predioVermelho.alt}
        className={`aspect-4/3 ${photoClass}`}
      />
    </div>
  );
}