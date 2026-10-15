import { HeroSection } from '../features/home/HeroSection';
import { IndicatorsPage } from '../features/indicators/IndicatorsPage';
import { ReportsSection } from '../features/reports/ReportsSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <div id="indicadores" className="scroll-mt-20">
        <IndicatorsPage />
      </div>
      <ReportsSection />
    </>
  );
}