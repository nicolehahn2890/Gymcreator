// Wo steht die Person: Tagesstand, naechster Tag, aktuelle Woche.
import type { PlanDay, ProgressionRules } from '../model/types';
import { hasValues, type EntryIndex } from './entries';
import { rowState, type RowContext } from './state';

export interface DayProgress {
  /** Zeilen mit allen Saetzen eingetragen. */
  done: number;
  /** Zeilen des Tages; im Kurz-Modus ohne die ausgelassenen (ausser sie wurden doch eingetragen). */
  total: number;
  /** Mindestens ein Wert eingetragen = Tag trainiert. */
  started: boolean;
}

export function dayProgress(ctx: RowContext, day: PlanDay, q: { cycle: number; week: number }): DayProgress {
  let done = 0;
  let total = 0;
  let started = false;
  for (const row of day.rows) {
    const st = rowState(ctx, row, q);
    const values = st.sets.length > 0 && hasValues({ sets: st.sets });
    if (st.skipped && !values) continue;
    total++;
    if (st.done) done++;
    if (values) started = true;
  }
  return { done, total, started };
}

/** Erster Tag der Woche ohne Eintraege; null = alle Tage trainiert. */
export function nextDayIndex(progress: DayProgress[]): number | null {
  const i = progress.findIndex((p) => !p.started);
  return i < 0 ? null : i;
}

/** Woche nach (cycle, week); nach der letzten Woche beginnt der naechste Zyklus. */
export function followingWeek(rules: ProgressionRules, cycle: number, week: number): { cycle: number; week: number } {
  return week >= rules.cycleWeeks ? { cycle: cycle + 1, week: 1 } : { cycle, week: week + 1 };
}

/** Juengste Woche mit Werten (Startposition beim Oeffnen); ohne Eintraege Zyklus 1, Woche 1. */
export function latestWeek(index: EntryIndex): { cycle: number; week: number } {
  let best = { cycle: 1, week: 1 };
  for (const e of index.byKey.values()) {
    if (!hasValues(e)) continue;
    if (e.cycle > best.cycle || (e.cycle === best.cycle && e.week > best.week)) best = { cycle: e.cycle, week: e.week };
  }
  return best;
}
