// Wochenart (3/4/5 Tage) je Woche. Port aus Peach (weekPt, setPlan): Vorauswahl = letzte festgelegte
// Woche davor im selben Zyklus, sonst der Standard aus dem Profil.
import type { DaysPerWeek, Entry, Plan, Week } from '../model/types';
import { hasValues } from './entries';

export function weekDays(weeks: Week[], cycle: number, week: number, fallback: DaysPerWeek): DaysPerWeek {
  for (let w = week; w >= 1; w--) {
    const rec = weeks.find((x) => x.cycle === cycle && x.week === w);
    if (rec) return rec.days;
  }
  return fallback;
}

/**
 * Slots mit Werten in dieser Woche, die in der neuen Wochenart pausieren wuerden. Nicht leer -> Rueckfrage
 * vor dem Umstellen. Die Werte bleiben gespeichert und sind beim Zurueckstellen wieder da.
 */
export function pausedSlotsWithValues(entries: Iterable<Entry>, cycle: number, week: number, plan: Plan): string[] {
  const inPlan = new Set(plan.dayPlans.flatMap((d) => d.rows.map((r) => r.slotId)));
  const out: string[] = [];
  for (const e of entries) {
    if (e.cycle === cycle && e.week === week && !inPlan.has(e.slotId) && hasValues(e)) out.push(e.slotId);
  }
  return out.sort();
}

/** Speichert die Wochenart einer Woche (ersetzt einen vorhandenen Wert). */
export function setWeekDays(weeks: Week[], cycle: number, week: number, days: DaysPerWeek): Week[] {
  return [...weeks.filter((x) => !(x.cycle === cycle && x.week === week)), { cycle, week, days }];
}
