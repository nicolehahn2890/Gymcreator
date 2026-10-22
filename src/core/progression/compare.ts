// Fortschritt gegenueber dem Vorwert. Port aus Peach (prog, rcol), Logik 1:1.
import { cmpWeight, type WeightInput } from './weight';

/** w = mehr Gewicht, r = mehr Wiederholungen, s = gleich, d = weniger. */
export type ProgressStatus = 'w' | 'r' | 's' | 'd';

export type RepInput = string | number | null | undefined;

export interface Performance {
  weight: WeightInput;
  reps: RepInput[];
}

function filledReps(reps: RepInput[]): number[] {
  return reps.map((v) => (v === '' || v == null ? NaN : parseInt(String(v), 10))).filter((n) => n > 0);
}

/**
 * Gewicht schlaegt Wiederholungen: mehr Gewicht -> w, weniger -> d (auch bei mehr Wdh.).
 * Bei gleichem Gewicht entscheidet der Durchschnitt je ausgefuelltem Satz (12/15 = 15/12).
 * null, solange eine Seite keine Wiederholungen hat.
 */
export function progressStatus(current: Performance, previous: Performance, assisted = false): ProgressStatus | null {
  const cur = filledReps(current.reps);
  const prev = filledReps(previous.reps);
  if (!cur.length || !prev.length) return null;
  const weight = cmpWeight(current.weight, previous.weight, assisted);
  if (weight > 0) return 'w';
  if (weight < 0) return 'd';
  const avg = (list: number[]) => list.reduce((a, b) => a + b, 0) / list.length;
  const c = avg(cur);
  const p = avg(prev);
  if (c > p + 1e-9) return 'r';
  if (c < p - 1e-9) return 'd';
  return 's';
}

/** Lage einer Wiederholungszahl im Bereich "min-max": top = Obergrenze erreicht, in = im Bereich, below = darunter. */
export function repZone(value: RepInput, repRange: string): 'top' | 'in' | 'below' | null {
  if (value === '' || value == null) return null;
  const n = parseInt(String(value), 10);
  if (Number.isNaN(n)) return null;
  const [min, max] = repRange.split('-').map(Number);
  if (min === undefined || max === undefined || Number.isNaN(min) || Number.isNaN(max)) return null;
  if (n >= max) return 'top';
  if (n >= min) return 'in';
  return 'below';
}
