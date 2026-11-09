interface Corner {
  /** Posição e largura do desenho (Tailwind). A altura vem da proporção do viewBox. */
  className: string;
  viewBox: string;
  shapes: readonly { d: string; fill: string }[];
}

/**
 * Cada canto é um SVG encostado na borda da seção. As formas começam e terminam nas bordas
 * do desenho, então as únicas partes retas ficam escondidas na borda da tela.
 */
const CORNERS: readonly Corner[] = [
  {
    className: 'top-0 left-0 w-40 -translate-x-[5%] -translate-y-[1%] sm:w-56 lg:w-64',
    viewBox: '0 0 320 200',
    shapes: [
      {
        d: 'M0 0H300C280 34 236 50 184 52C130 54 96 70 66 104C44 128 22 140 0 144Z',
        fill: 'fill-city-teal',
      },
      {
        d: 'M0 0H150C162 42 146 86 110 118C80 144 42 168 0 182Z',
        fill: 'fill-city-red',
      },
    ],
  },
  {
    className: 'top-0 right-0 w-24 translate-x-[15%] -translate-y-[15%] sm:w-32 lg:w-40',
    viewBox: '0 0 200 160',
    shapes: [
      {
        d: 'M36 0C40 62 84 112 146 116C166 118 184 113 200 106V0Z',
        fill: 'fill-city-orange',
      },
    ],
  },
  {
    className: 'bottom-0 left-0 w-24 sm:w-32 lg:w-40',
    viewBox: '0 0 220 140',
    shapes: [
      {
        d: 'M0 34C52 32 98 60 118 100C125 114 128 127 129 140H0Z',
        fill: 'fill-city-orange',
      },
    ],
  },
  {
    className: 'right-0 bottom-0 w-64 translate-x-[2%] translate-y-[20%] sm:w-96 lg:w-[30rem]',
    viewBox: '0 0 480 140',
    shapes: [
      {
        d: 'M0 140C70 136 120 114 178 96C236 78 282 90 334 66C374 48 410 28 480 34V140Z',
        fill: 'fill-city-red',
      },
      {
        d: 'M392 140C396 96 418 54 452 32C462 26 471 22 480 20V140Z',
        fill: 'fill-city-teal',
      },
    ],
  },
];

/** Formas decorativas nos cantos do hero, nas cores do logo da cidade. */
export function HeroBlobs() {
  return (
    <div aria-hidden="true">
      {CORNERS.map((corner) => (
        <svg
          key={corner.className}
          viewBox={corner.viewBox}
          className={`pointer-events-none absolute ${corner.className}`}
        >
          {corner.shapes.map((shape) => (
            <path key={shape.d} d={shape.d} className={shape.fill} />
          ))}
        </svg>
      ))}
    </div>
  );
}