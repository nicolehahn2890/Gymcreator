// Aenderungen aus der Oberflaeche: Eintraege anlegen/aendern, Wochenart festhalten.
import type { Entry, Plan, PlanRow, SetValue } from '../../core/model/types';
import { getEntry } from '../../core/progression/entries';
import { createEntry } from '../../core/progression/inherit';
import type { RowState } from '../../core/progression/state';
import type { AppModel } from './model';
import { store } from './store';

export interface Position {
  cycle: number;
  week: number;
}

/** Gespeicherter Eintrag oder ein neuer mit der aktuell angezeigten Uebung und Zusatzsaetzen. */
export function entryForEdit(model: AppModel, row: PlanRow, pos: Position, day: number, st: RowState): Entry {
  return getEntry(model.index, pos.cycle, pos.week, row.slotId) ?? createEntry(row, { ...pos, day }, st.exerciseId, st.extraSets);
}

/** Speichert den Eintrag; beim ersten Eintrag einer Woche wird die Wochenart festgehalten. */
export function saveEntry(model: AppModel, plan: Plan, entry: Entry): void {
  const known = model.data.weeks.some((w) => w.cycle === entry.cycle && w.week === entry.week);
  if (!known) void store.putWeek({ cycle: entry.cycle, week: entry.week, days: plan.days });
  void store.putEntry(entry);
}

/**
 * Setzt Gewicht oder Wiederholungen eines Satzes. Ein eingetragenes Gewicht wird in die folgenden
 * Saetze uebernommen, solange dort noch keins steht (spart Tippen bei gleichem Gewicht).
 */
export function withSetValue(entry: Entry, totalSets: number, index: number, patch: Partial<SetValue>): Entry {
  const length = Math.max(totalSets, entry.sets.length, index + 1);
  const sets: SetValue[] = Array.from({ length }, (_, i) => entry.sets[i] ?? { w: '', r: null });
  const current = sets[index] ?? { w: '', r: null };
  sets[index] = { ...current, ...patch };
  if (patch.w !== undefined && patch.w.trim() !== '') {
    for (let i = index + 1; i < totalSets; i++) {
      const s = sets[i];
      if (s && s.w.trim() === '') sets[i] = { ...s, w: patch.w };
    }
  }
  // leere Saetze am Ende nicht speichern
  while (sets.length && sets[sets.length - 1]?.w === '' && sets[sets.length - 1]?.r === null) sets.pop();
  return { ...entry, sets };
}
