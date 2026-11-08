import { useEffect, useState } from 'react';

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarRelatorios } from '../../services/relatorios';
import type { PublicReport } from '../../types';
import { PUBLIC_REPORTS } from './data';

export type ReportsStatus = 'loading' | 'ready' | 'error';

export interface UseReportsOptions {
  reports?: readonly PublicReport[];
}

export interface UseReportsResult {
  reports: readonly PublicReport[];
  status: ReportsStatus;
  error: Error | null;
}

export function useReports(options: UseReportsOptions = {}): UseReportsResult {
  const explicitReports = options.reports;
  const useExplicit = explicitReports !== undefined;
  const [fetchedReports, setReports] = useState<readonly PublicReport[]>([]);
  const [status, setStatus] = useState<ReportsStatus>(() => (useExplicit ? 'ready' : 'loading'));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useExplicit) return;
    let cancelled = false;

    const resolveReports = isMockMode()
      ? Promise.resolve(PUBLIC_REPORTS as readonly PublicReport[])
      : listarRelatorios()
          .then((response) => response.relatorios as readonly PublicReport[])
          .catch((err: unknown) => {
            if (shouldUseFallback()) {
              console.warn(
                '[useReports] Falha ao buscar relatórios da API; usando dados demonstrativos.',
                err,
              );
              return PUBLIC_REPORTS as readonly PublicReport[];
            }
            throw err;
          });

    resolveReports
      .then((data) => {
        if (cancelled) return;
        setReports(data);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Falha ao buscar os relatórios.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [useExplicit]);

  return {
    reports: useExplicit ? explicitReports : fetchedReports,
    status: useExplicit ? 'ready' : status,
    error: useExplicit ? null : error,
  };
}
