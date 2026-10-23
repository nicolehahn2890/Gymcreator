// Abgeleitete Daten fuer die Oberflaeche: Plaene je Wochenart, Uebungs-Lookup, Kontext fuer den
// Progressions-Kern. Wird bei jeder Datenaenderung neu gebaut (unveraenderlich).
import { buildPlan, effectiveDays } from '../../core/generator/buildPlan';
import { exerciseData, planData } from '../../core/model/data';
import { DAY_COUNTS, type CategoryId, type DaysPerWeek, type Focus, type GoalId, type Plan, type PlanRow, type Profile } from '../../core/model/types';
import { carryOver } from '../../core/progression/cycle';
import { indexEntries, type EntryIndex } from '../../core/progression/entries';
import type { RowContext } from '../../core/progression/state';
import { weekDays } from '../../core/progression/week';
import { text } from '../../i18n';
import type { StoredData } from '../../storage/interface';

export interface ExerciseInfo {
  id: string;
  name: string;
  category: CategoryId;
  equipment: string[];
  focus: Focus[];
  stars: GoalId[];
  assisted: boolean;
  timed: boolean;
  tip: string;
  custom: boolean;
}

export interface AppModel {
  data: StoredData;
  profile: Profile;
  plans: Record<DaysPerWeek, Plan>;
  exercises: Map<string, ExerciseInfo>;
  index: EntryIndex;
  carryCache: Map<string, Record<string, string>>;
}

export function buildModel(data: StoredData, profile: Profile): AppModel {
  const { goal, level } = profile;
  const plans = Object.fromEntries(DAY_COUNTS.map((days) => [days, buildPlan(planData, { goal, level, days })])) as Record<DaysPerWeek, Plan>;
  const exercises = new Map<string, ExerciseInfo>();
  for (const e of exerciseData.exercises) {
    exercises.set(e.id, {
      id: e.id,
      name: e.name[profile.lang] || e.name.de,
      category: e.category,
      equipment: e.equipment,
      focus: e.focus,
      stars: e.stars,
      assisted: e.assisted,
      timed: e.timed,
      tip: e.tip.de,
      custom: false,
    });
  }
  for (const c of data.custom) {
    exercises.set(c.id, { id: c.id, name: c.name, category: c.category, equipment: c.equipment, focus: [], stars: [], assisted: false, timed: false, tip: '', custom: true });
  }
  return { data, profile, plans, exercises, index: indexEntries(data.entries), carryCache: new Map() };
}

export function daysFor(model: AppModel, cycle: number, week: number): DaysPerWeek {
  return effectiveDays(planData, model.profile.level, weekDays(model.data.weeks, cycle, week, model.profile.days));
}

/** Waehlbare Tage pro Woche fuer die Stufe des Profils. */
export function dayOptions(model: AppModel): DaysPerWeek[] {
  return planData.goals.levels[model.profile.level].days;
}

export function planFor(model: AppModel, cycle: number, week: number): Plan {
  return model.plans[daysFor(model, cycle, week)];
}

export function rowContext(model: AppModel, cycle: number, week: number): RowContext {
  const plan = planFor(model, cycle, week);
  const key = `${cycle}:${plan.days}`;
  let carried = model.carryCache.get(key);
  if (!carried) {
    carried = carryOver(model.data.entries, cycle, plan, (id) => model.exercises.get(id)?.category);
    model.carryCache.set(key, carried);
  }
  const carriedMap = carried;
  return {
    index: model.index,
    limits: planData.goals.limits,
    rules: planData.goals.progression,
    isAssisted: (id) => model.exercises.get(id)?.assisted ?? false,
    carried: (slotId) => carriedMap[slotId],
  };
}

/** Muskelgruppe der Zeile, mit Hinweis aus dem Slot: "Rücken · Ziehen von oben". */
export function slotLabel(row: Pick<PlanRow, 'category' | 'focus'>): string {
  const cat = planData.goals.categories[row.category]?.label.de ?? row.category;
  return row.focus ? `${cat} · ${text.focus[row.focus]}` : cat;
}

export function exerciseName(model: AppModel, id: string): string {
  return model.exercises.get(id)?.name ?? '';
}

/** Schrittweite fuer den Gewichtsvorschlag: eigene Einstellung, sonst Standard der ersten Ausstattung. */
export function incrementFor(model: AppModel, exerciseId: string): number | null {
  const eq = model.exercises.get(exerciseId)?.equipment[0];
  if (!eq) return null;
  const own = model.profile.increments[eq];
  return own !== undefined ? own : (exerciseData.increments[eq] ?? null);
}
