// UI-Position (Tab, Woche, offener Tag/Uebung, Pausentimer) in localStorage, damit die App nach dem
// Wechsel in eine andere App dort weitermacht. Keine Trainingsdaten - die liegen in IndexedDB.
import { useCallback, useState } from 'react';

export type Tab = 'today' | 'plan' | 'progress' | 'settings';

export interface UiState {
  tab: Tab;
  cycle: number | null;
  week: number | null;
  /** Geoeffneter Trainingstag (Index) und Uebung (Slot-ID). */
  day: number | null;
  slot: string | null;
  /** Ende der Pause als Zeitstempel (ms); laeuft auch weiter, wenn die App im Hintergrund war. */
  restEndsAt: number | null;
}

const KEY = 'gymcreator_ui';
const initial: UiState = { tab: 'today', cycle: null, week: null, day: null, slot: null, restEndsAt: null };

function load(): UiState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...(JSON.parse(raw) as Partial<UiState>) } : initial;
  } catch {
    return initial;
  }
}

export function useUiState(): [UiState, (patch: Partial<UiState>) => void] {
  const [state, setState] = useState<UiState>(load);
  const update = useCallback((patch: Partial<UiState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // privater Modus o. Ae.: Position wird dann nicht gemerkt
      }
      return next;
    });
  }, []);
  return [state, update];
}
