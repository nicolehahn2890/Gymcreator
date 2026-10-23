// Vererbung der Uebung und Uebungswechsel. Port aus Peach (inhEx, exBase, selEx, initKey).
import type { Entry, PlanRow } from '../model/types';
import { baseExercise, getEntry, type EntryIndex } from './entries';

/**
 * Uebung aus der letzten frueheren Woche dieses Zyklus, in der die Zeile gespeichert ist (auch ueber
 * ausgelassene Wochen). Bei "nur diese Woche" wird die Uebung davor weitergegeben. Ein bewusst
 * geleertes Feld ("") bleibt leer. undefined = in diesem Zyklus noch nichts gespeichert.
 */
export function inheritExercise(index: EntryIndex, q: { cycle: number; week: number; slotId: string }): string | undefined {
  for (let w = q.week - 1; w >= 1; w--) {
    const e = getEntry(index, q.cycle, w, q.slotId);
    if (e) return baseExercise(e);
  }
  return undefined;
}

/** Zusatzsaetze erben nur von der direkten Vorwoche (Peach). */
export function inheritExtraSets(index: EntryIndex, q: { cycle: number; week: number; slotId: string }): number {
  return getEntry(index, q.cycle, q.week - 1, q.slotId)?.extraSets ?? 0;
}

/** Neuer Eintrag mit dem Kontext der Plan-Zeile (Kategorie, Bereich, Basis-Saetze stehen im Eintrag). */
export function createEntry(row: PlanRow, q: { cycle: number; week: number; day: number }, exerciseId: string, extraSets: number): Entry {
  return {
    cycle: q.cycle,
    week: q.week,
    slotId: row.slotId,
    day: q.day,
    exerciseId,
    sets: [],
    extraSets,
    category: row.category,
    repRange: row.repRange,
    baseSets: row.sets,
  };
}

export type ExerciseChange = 'set' | 'ask' | 'unchanged';

/**
 * Was beim Waehlen einer Uebung passiert (Peach selEx): Rueckfrage "Nur diese Woche / Ab jetzt im Zyklus"
 * nur ab Woche 2, wenn es eine vererbte Uebung gibt und eine andere gewaehlt wird. Keine Frage beim
 * Leeren, in Woche 1, ohne Vorgeschichte, bei der vererbten Uebung oder unveraenderter Auswahl.
 */
export function exerciseChange(current: Entry | undefined, week: number, inherited: string | undefined, next: string): ExerciseChange {
  const inh = week > 1 ? (inherited ?? '') : '';
  if (!next || !inh || next === inh) return 'set';
  if (current && next === current.exerciseId && !current.once) return 'unchanged';
  return 'ask';
}

/** Setzt die Uebung; once = "nur diese Woche" (die vererbte Uebung bleibt Standard). */
export function applyExercise(entry: Entry, next: string, once: boolean, inherited: string | undefined): Entry {
  const result: Entry = { ...entry, exerciseId: next };
  delete result.once;
  delete result.baseExerciseId;
  return once ? { ...result, once: true, baseExerciseId: inherited ?? '' } : result;
}
