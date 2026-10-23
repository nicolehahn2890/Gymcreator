// Kurz-Modus: weniger Saetze je Uebung, damit ein Tag in eine kuerzere Zeit passt. Alle Uebungen bleiben;
// die Steigerung haengt am 1. Satz, der Vergleich am Schnitt je Satz, beides bleibt also gueltig.
import type { PlanRow, Timing } from '../model/types';
import { estimateMinutes } from './position';

export type ShortRow = Pick<PlanRow, 'slotId' | 'repRange' | 'sets' | 'priority'>;

/**
 * Saetze je Zeile fuer hoechstens `minutes` geschaetzte Minuten. Nimmt immer einen Satz bei der Zeile mit den
 * meisten Saetzen weg (bei Gleichstand die mit niedrigerer Prioritaet, dann die spaetere), jede Zeile behaelt
 * mindestens einen Satz. null, wenn der Tag schon so kurz ist oder es auch mit einem Satz je Uebung nicht reicht.
 */
export function shortSets(rows: readonly ShortRow[], timing: Timing, minutes: number): Record<string, number> | null {
  if (estimateMinutes(rows, timing) <= minutes) return null;
  const work = rows.map((r, i) => ({ ...r, i }));
  while (estimateMinutes(work, timing) > minutes) {
    const candidates = work.filter((r) => r.sets > 1);
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.sets - a.sets || a.priority - b.priority || b.i - a.i);
    const pick = candidates[0];
    if (pick) pick.sets -= 1;
  }
  return Object.fromEntries(work.map((r) => [r.slotId, r.sets]));
}
