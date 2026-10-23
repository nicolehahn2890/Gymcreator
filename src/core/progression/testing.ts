// Hilfen fuer die Szenario-Tests: echte Apfel-Plaene (3/4/5 Tage), Eintraege kurz anlegen, Kontext bauen.
import { buildPlan } from '../generator/buildPlan';
import { exerciseData, planData } from '../model/data';
import type { DaysPerWeek, Entry, Plan, PlanRow } from '../model/types';
import { indexEntries } from './entries';
import type { RowContext } from './state';

export const plans: Record<3 | 4 | 5, Plan> = {
  3: buildPlan(planData, { goal: 'apfel', days: 3 }),
  4: buildPlan(planData, { goal: 'apfel', days: 4 }),
  5: buildPlan(planData, { goal: 'apfel', days: 5 }),
};

export function rowOf(slotId: string, days: DaysPerWeek = 4): PlanRow & { day: number } {
  for (const d of plans[days].dayPlans) {
    const row = d.rows.find((r) => r.slotId === slotId);
    if (row) return { ...row, day: d.index };
  }
  throw new Error(`Slot ${slotId} nicht im ${days}-Tage-Plan`);
}

/** Eintrag: alle Saetze mit demselben Gewicht (wie Peachs Gewichtsfeld), Wiederholungen je Satz. */
export function entry(
  cycle: number,
  week: number,
  slotId: string,
  exerciseId: string,
  weight: string,
  reps: (number | null)[],
  extra: Partial<Entry> & { days?: DaysPerWeek } = {},
): Entry {
  const { days, ...rest } = extra;
  const row = rowOf(slotId, days ?? 4);
  const sets = reps.length ? reps.map((r) => ({ w: weight, r })) : weight ? [{ w: weight, r: null }] : [];
  return {
    cycle,
    week,
    slotId,
    day: row.day,
    exerciseId,
    sets,
    extraSets: 0,
    category: row.category,
    repRange: row.repRange,
    baseSets: row.sets,
    ...rest,
  };
}

const assisted = new Set(exerciseData.exercises.filter((e) => e.assisted).map((e) => e.id));

export function context(entries: Entry[], carried: Record<string, string> = {}): RowContext {
  return {
    index: indexEntries(entries),
    limits: planData.goals.limits,
    rules: planData.goals.progression,
    isAssisted: (id) => assisted.has(id),
    carried: (slotId) => carried[slotId],
  };
}
