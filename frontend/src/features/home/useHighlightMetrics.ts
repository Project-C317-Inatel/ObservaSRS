import { useEffect, useState } from 'react';

import iconeEmprego from '../../assets/icons/emprego.png';
import iconeEmpresa from '../../assets/icons/empresa.png';
import iconeHotel from '../../assets/icons/hotel.png';
import iconeLeito from '../../assets/icons/leito.png';
import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarDestaquesHome } from '../../services/indicadores';
import type { ApiHighlightMetric } from '../../types';
import { HIGHLIGHT_METRICS, type HighlightMetric } from './data';

export type HighlightMetricsStatus = 'loading' | 'ready' | 'error';

export interface UseHighlightMetricsOptions {
  metrics?: readonly HighlightMetric[];
}

export interface UseHighlightMetricsResult {
  metrics: readonly HighlightMetric[];
  status: HighlightMetricsStatus;
  error: Error | null;
}

const DEFAULT_ICONS: Record<string, { icon: string; iconClass: string }> = {
  hospedagens: { icon: iconeHotel, iconClass: 'bg-data-sky' },
  leitos: { icon: iconeLeito, iconClass: 'bg-brand-purple' },
  empresas: { icon: iconeEmpresa, iconClass: 'bg-data-cyan' },
  empregos: { icon: iconeEmprego, iconClass: 'bg-brand-magenta' },
};

function adaptApiHighlight(item: ApiHighlightMetric): HighlightMetric {
  const visual = DEFAULT_ICONS[item.id] ?? {
    icon: iconeHotel,
    iconClass: 'bg-data-sky',
  };

  return {
    id: item.id,
    value: item.valor,
    label: item.rotulo,
    caption: item.legenda,
    icon: visual.icon,
    iconClass: visual.iconClass,
  };
}

export function useHighlightMetrics(
  options: UseHighlightMetricsOptions = {},
): UseHighlightMetricsResult {
  const explicitMetrics = options.metrics;
  const useExplicit = explicitMetrics !== undefined;

  const [fetchedMetrics, setFetchedMetrics] = useState<readonly HighlightMetric[]>([]);
  const [status, setStatus] = useState<HighlightMetricsStatus>(() =>
    useExplicit ? 'ready' : 'loading',
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useExplicit) return;

    let cancelled = false;

    const resolveMetrics = isMockMode()
      ? Promise.resolve(HIGHLIGHT_METRICS)
      : listarDestaquesHome()
          .then((response) => response.destaques.map(adaptApiHighlight))
          .catch((err: unknown) => {
            if (shouldUseFallback()) {
              console.warn(
                '[useHighlightMetrics] Falha ao buscar métricas de destaque da API; usando dados demonstrativos.',
                err,
              );
              return HIGHLIGHT_METRICS;
            }
            throw err;
          });

    resolveMetrics
      .then((data) => {
        if (cancelled) return;
        setFetchedMetrics(data);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err : new Error('Falha ao buscar as métricas de destaque.'),
        );
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [useExplicit]);

  const metrics = useExplicit ? explicitMetrics : fetchedMetrics;
  const currentStatus = useExplicit ? 'ready' : status;

  return { metrics, status: currentStatus, error };
}
