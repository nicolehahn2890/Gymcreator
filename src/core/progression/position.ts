// Wo steht die Person: Tagesstand, naechster Tag, aktuelle Woche, Dauer-Schaetzung.
import type { PlanDay, ProgressionRules, Timing } from '../model/types';
import { hasValues, type EntryIndex } from './entries';
import { rowState, type RowContext } from './state';

export interface DayProgress {
  /** Zeilen mit allen Saetzen eingetragen. */
  done: number;
  total: number;
  /** Mindestens ein Wert eingetragen = Tag trainiert. */
  started: boolean;
}

export function dayProgress(ctx: RowContext, day: PlanDay, q: { cycle: number; week: number }): DayProgress {
  let done = 0;
  let started = false;
  for (const row of day.rows) {
    const st = rowState(ctx, row, q);
    if (st.done) done++;
    if (st.sets.length && hasValues({ sets: st.sets })) started = true;
  }
  return { done, total: day.rows.length, started };
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

/** Geschaetzte Dauer in Minuten (auf 5 gerundet): Saetze x (Satzdauer + Pause des Bereichs). */
export function estimateMinutes(day: PlanDay, timing: Timing): number {
  const seconds = day.rows.reduce((sum, r) => sum + r.sets * (timing.setSeconds + (timing.restSeconds[r.repRange] ?? 0)), 0);
  return Math.max(5, Math.round(seconds / 300) * 5);
}
