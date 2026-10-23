// Aenderungen aus der Oberflaeche: Eintraege anlegen/aendern, Wochenart festhalten.
import type { Entry, Plan, PlanRow, SetValue } from '../../core/model/types';
import { getEntry, hasValues } from '../../core/progression/entries';
import { createEntry } from '../../core/progression/inherit';
import type { RowState } from '../../core/progression/state';
import type { AppModel } from './model';
import { store } from './store';

export interface Position {
  cycle: number;
  week: number;
}

/**
 * Gespeicherter Eintrag oder ein neuer mit der aktuell angezeigten Uebung und Zusatzsaetzen. Hat der
 * gespeicherte Eintrag noch keine Werte, uebernimmt er Bereich, Saetze und Tag aus dem aktuellen Plan.
 */
export function entryForEdit(model: AppModel, row: PlanRow, pos: Position, day: number, st: RowState): Entry {
  const stored = getEntry(model.index, pos.cycle, pos.week, row.slotId);
  if (!stored) return createEntry(row, { ...pos, day }, st.exerciseId, st.extraSets);
  return hasValues(stored) ? stored : { ...stored, day, category: row.category, repRange: row.repRange, baseSets: row.sets };
}

/** Zusatzsaetze setzen; Werte entfernter Saetze werden geloescht, damit sie in spaeteren Vergleichen nicht mitzaehlen. */
export function withExtraSets(entry: Entry, extraSets: number, totalSets: number): Entry {
  return { ...entry, extraSets, sets: entry.sets.slice(0, totalSets) };
}

/** Speichert den Eintrag; beim ersten Eintrag einer Woche wird die Wochenart festgehalten. */
export function saveEntry(model: AppModel, plan: Plan, entry: Entry): void {
  const known = model.data.weeks.some((w) => w.cycle === entry.cycle && w.week === entry.week);
  if (!known) void store.putWeek({ cycle: entry.cycle, week: entry.week, days: plan.days });
  void store.putEntry(entry);
}

/**
 * Setzt Gewicht oder Wiederholungen eines Satzes. Das Gewicht wandert in die folgenden Saetze ohne
 * Wiederholungen mit, wenn dort nichts oder bisher dasselbe Gewicht stand (spart Tippen; beim Tippen
 * von "27,5" kommt so nicht nur die erste Ziffer an).
 */
export function withSetValue(entry: Entry, totalSets: number, index: number, patch: Partial<SetValue>): Entry {
  const length = Math.max(totalSets, entry.sets.length, index + 1);
  const sets: SetValue[] = Array.from({ length }, (_, i) => entry.sets[i] ?? { w: '', r: null });
  const current = sets[index] ?? { w: '', r: null };
  sets[index] = { ...current, ...patch };
  if (patch.w !== undefined) {
    for (let i = index + 1; i < totalSets; i++) {
      const s = sets[i];
      if (s && s.r === null && (s.w.trim() === '' || s.w === current.w)) sets[i] = { ...s, w: patch.w };
    }
  }
  // leere Saetze am Ende nicht speichern
  while (sets.length && sets[sets.length - 1]?.w === '' && sets[sets.length - 1]?.r === null) sets.pop();
  return { ...entry, sets };
}
