// Gespeicherte Eintraege: Schluessel, Index und Lesehilfen. Schluessel ist nie eine Position: cycle:week:slotId.
import type { Entry, SetValue } from '../model/types';
import type { Performance } from './compare';
import { weightBounds } from './weight';

export function entryKey(cycle: number, week: number, slotId: string): string {
  return `${cycle}:${week}:${slotId}`;
}

/** Reihenfolge Zyklus > Woche > Tag (Peach exOrd ohne Position). */
export function entryOrder(e: Pick<Entry, 'cycle' | 'week' | 'day'>): number {
  return e.cycle * 10000 + e.week * 100 + e.day;
}

export function hasReps(sets: SetValue[]): boolean {
  return sets.some((s) => s.r !== null && s.r > 0);
}

/** Eintrag mit echtem Inhalt: ein Gewicht oder mindestens eine Wiederholung. */
export function hasValues(e: Pick<Entry, 'sets'>): boolean {
  return e.sets.some((s) => s.w.trim() !== '' || s.r !== null);
}

/** Die Uebung, die weitergegeben wird: bei "nur diese Woche" die Uebung davor (Peach exBase). */
export function baseExercise(e: Pick<Entry, 'exerciseId' | 'once' | 'baseExerciseId'>): string {
  return e.once ? (e.baseExerciseId ?? '') : e.exerciseId;
}

/** Satzgewichte als eine Angabe: gleich -> "40", verschieden -> "40-45" (wie Peachs Gewichtsrahmen), leer -> "". */
export function combinedWeight(sets: SetValue[]): string {
  let lo = Infinity;
  let hi = -Infinity;
  for (const s of sets) {
    const b = weightBounds(s.w);
    if (!b) continue;
    lo = Math.min(lo, b.lo);
    hi = Math.max(hi, b.hi);
  }
  if (lo === Infinity) return '';
  return lo === hi ? String(lo) : `${lo}-${hi}`;
}

export function performanceOf(sets: SetValue[]): Performance {
  return { weight: combinedWeight(sets), reps: sets.map((s) => s.r) };
}

export interface EntryIndex {
  byKey: Map<string, Entry>;
  /** Je Uebung alle Eintraege mit Inhalt, aufsteigend nach entryOrder. */
  byExercise: Map<string, Entry[]>;
}

export function indexEntries(entries: Iterable<Entry>): EntryIndex {
  const byKey = new Map<string, Entry>();
  const byExercise = new Map<string, Entry[]>();
  for (const e of entries) {
    byKey.set(entryKey(e.cycle, e.week, e.slotId), e);
    if (!e.exerciseId || !hasValues(e)) continue;
    byExercise.set(e.exerciseId, [...(byExercise.get(e.exerciseId) ?? []), e]);
  }
  for (const list of byExercise.values()) list.sort((a, b) => entryOrder(a) - entryOrder(b) || a.slotId.localeCompare(b.slotId));
  return { byKey, byExercise };
}

export function getEntry(index: EntryIndex, cycle: number, week: number, slotId: string): Entry | undefined {
  return index.byKey.get(entryKey(cycle, week, slotId));
}
