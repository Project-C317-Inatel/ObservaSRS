/** Forma orgânica com centro em (0,0), desenhada num viewBox de -100 a 100. */
const BLOB =
  'M44.7,-58.2C57.2,-49.1,66.1,-34.6,70.3,-18.6C74.5,-2.6,74,15,66.4,28.6C58.8,42.2,44.1,51.9,28.3,59.3C12.5,66.7,-4.4,71.8,-20.5,68.3C-36.6,64.8,-51.9,52.7,-61.8,37.1C-71.7,21.5,-76.2,2.4,-71.6,-14.1C-67,-30.6,-53.3,-44.5,-38.3,-53.1C-23.3,-61.7,-7,-64.9,8.4,-65.3C23.8,-65.7,32.2,-67.3,44.7,-58.2Z';

const cornerClass = 'pointer-events-none absolute w-36 sm:w-56 lg:w-72';


export function HeroBlobs() {
  return (
    <div aria-hidden="true">
      <svg viewBox="-100 -100 200 200" className={`${cornerClass} -top-16 -left-16`}>
        <path d={BLOB} transform="translate(20 -30) scale(1.2)" className="fill-city-teal" />
        <path d={BLOB} transform="rotate(40)" className="fill-city-red" />
      </svg>
      <svg viewBox="-100 -100 200 200" className={`${cornerClass} -top-20 -right-20`}>
        <path d={BLOB} transform="rotate(120)" className="fill-city-orange" />
      </svg>
      <svg viewBox="-100 -100 200 200" className={`${cornerClass} -bottom-20 -left-20`}>
        <path d={BLOB} transform="rotate(200)" className="fill-city-orange" />
      </svg>
      <svg viewBox="-100 -100 200 200" className={`${cornerClass} -right-16 -bottom-16`}>
        <path d={BLOB} transform="translate(-25 10) rotate(80)" className="fill-city-red" />
        <path d={BLOB} transform="translate(35 -20) scale(0.8)" className="fill-city-teal" />
      </svg>
    </div>
  );
}