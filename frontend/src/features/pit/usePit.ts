import { useCallback, useEffect, useState } from 'react';

import { isMockMode, shouldUseFallback } from '../../services/fallback';
import { listarItensPit } from '../../services/pit';
import type { PitCategory, PitItem } from '../../types';
import { filterPitItems, PIT_ITEMS } from './data';

export type PitStatus = 'loading' | 'ready' | 'error';

export interface UsePitOptions {
  items?: readonly PitItem[];
}

export interface UsePitResult {
  items: readonly PitItem[];
  status: PitStatus;
  error: Error | null;
  activeCategory: PitCategory | null;
  setCategory: (category: PitCategory | null) => void;
}

export function usePit(options: UsePitOptions = {}): UsePitResult {
  const explicitItems = options.items;
  const useExplicit = explicitItems !== undefined;

  const [fetchedItems, setFetchedItems] = useState<readonly PitItem[]>([]);
  const [status, setStatus] = useState<PitStatus>(() => (useExplicit ? 'ready' : 'loading'));
  const [error, setError] = useState<Error | null>(null);
  const [activeCategory, setActiveCategory] = useState<PitCategory | null>(null);

  useEffect(() => {
    if (useExplicit) return;

    let cancelled = false;

    const resolveItems = isMockMode()
      ? Promise.resolve(PIT_ITEMS as readonly PitItem[])
      : listarItensPit()
          .then((response) => response.itens as readonly PitItem[])
          .catch((err: unknown) => {
            if (shouldUseFallback()) {
              console.warn(
                '[usePit] Falha ao buscar itens do PIT da API; usando dados demonstrativos.',
                err,
              );
              return PIT_ITEMS as readonly PitItem[];
            }
            throw err;
          });

    resolveItems
      .then((data) => {
        if (cancelled) return;
        setFetchedItems(data);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Falha ao buscar os itens do PIT.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [useExplicit]);

  const setCategory = useCallback((category: PitCategory | null) => {
    setActiveCategory(category);
  }, []);

  const allItems = useExplicit ? explicitItems : fetchedItems;
  const items = filterPitItems(allItems, activeCategory);
  const currentStatus = useExplicit ? 'ready' : status;

  return { items, status: currentStatus, error, activeCategory, setCategory };
}
