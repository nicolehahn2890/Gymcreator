// Abgeleitete Daten fuer die Oberflaeche: Plaene je Wochenart, Uebungs-Lookup, Kontext fuer den
// Progressions-Kern. Wird bei jeder Datenaenderung neu gebaut (unveraenderlich).
import { buildPlan } from '../../core/generator/buildPlan';
import { exerciseData, planData } from '../../core/model/data';
import { DAY_COUNTS, type CategoryId, type DaysPerWeek, type Focus, type GoalId, type Plan, type PlanDay, type PlanRow, type Profile } from '../../core/model/types';
import { carryOver } from '../../core/progression/cycle';
import { indexEntries, type EntryIndex } from '../../core/progression/entries';
import { shortTiming, type ShortContext } from '../../core/progression/short';
import { rowState, type RowContext, type RowState } from '../../core/progression/state';
import { estimateMinutes, muscleSets } from '../../core/generator/validate';
import { weekDays } from '../../core/progression/week';
import { fmt, range, text } from '../../i18n';
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
  const { goal } = profile;
  const plans = Object.fromEntries(DAY_COUNTS.map((days) => [days, buildPlan(planData, { goal, days })])) as Record<DaysPerWeek, Plan>;
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
  return weekDays(model.data.weeks, cycle, week, model.profile.days);
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
  const short = model.data.weeks.find((w) => w.cycle === cycle && w.week === week)?.short;
  return {
    index: model.index,
    limits: planData.goals.limits,
    rules: planData.goals.progression,
    isAssisted: (id) => model.exercises.get(id)?.assisted ?? false,
    carried: (slotId) => carriedMap[slotId],
    ...(short && { short: Object.fromEntries(Object.entries(short).map(([slotId, s]) => [slotId, s.sets])) }),
  };
}

/** Tag im Kurz-Modus dieser Woche? */
export function isShortDay(ctx: RowContext, day: PlanDay): boolean {
  return day.rows.some((r) => ctx.short?.[r.slotId] !== undefined);
}

/** Geschaetzte Minuten eines Tages mit den Saetzen dieser Woche (Zusatzsaetze, Kurz-Modus mit seinen kuerzeren Pausen). */
export function dayMinutes(ctx: RowContext, day: PlanDay, pos: { cycle: number; week: number }): number {
  const timing = isShortDay(ctx, day) ? shortTiming({ timing: planData.goals.timing, rules: planData.goals.short }) : planData.goals.timing;
  return estimateMinutes(dayRows(ctx, day, pos).map((r) => ({ repRange: r.repRange, sets: r.target })), timing);
}

/** Zeilen eines Tages mit den Saetzen dieser Woche (Zusatzsaetze) und dem Ziel im Kurz-Modus (0 = ausgelassen). */
export function dayRows(ctx: RowContext, day: PlanDay, pos: { cycle: number; week: number }) {
  return day.rows.map((row) => {
    const st = rowState(ctx, row, pos);
    return { slotId: row.slotId, category: row.category, repRange: st.repRange, priority: row.priority, sets: st.totalSets, target: st.skipped ? 0 : st.targetSets };
  });
}

/** Regeln fuer den Kurz-Modus aus data/goals.json, mit den Wochenzielen des gewaehlten Ziels. */
export function shortContext(model: AppModel): ShortContext {
  const g = planData.goals;
  return { timing: g.timing, rules: g.short, ranges: g.ranges, categories: g.categories, targets: g.goals[model.profile.goal].targets };
}

/**
 * Anteilige Saetze je Muskel in dieser Woche, wie sie gerade aussieht: andere Tage mit ihrem Kurz-Modus, der Tag
 * `day` komplett. Grundlage fuer den Kurz-Modus (was die Woche am wenigsten braucht, faellt zuerst weg).
 */
export function weekVolume(model: AppModel, pos: { cycle: number; week: number }, day: PlanDay): Record<string, number> {
  const ctx = rowContext(model, pos.cycle, pos.week);
  const rows = planFor(model, pos.cycle, pos.week).dayPlans.flatMap((d) => dayRows(ctx, d, pos).map((r) => ({ category: r.category, sets: d.index === day.index ? r.sets : r.target })));
  return muscleSets(planData.goals.categories, rows);
}

/** Muskelgruppe der Zeile, mit Hinweis aus dem Slot: "Rücken · Ziehen von oben". */
export function slotLabel(row: Pick<PlanRow, 'category' | 'focus'>): string {
  const cat = planData.goals.categories[row.category]?.label.de ?? row.category;
  return row.focus ? `${cat} · ${text.focus[row.focus]}` : cat;
}

/** Saetze der Zeile: "3 × 8–12 Wdh.", bei Halte-Uebungen "3 Sätze halten". */
export function setsText(model: AppModel, st: Pick<RowState, 'exerciseId' | 'targetSets' | 'repRange'>): string {
  const t = text.workout;
  return model.exercises.get(st.exerciseId)?.timed ? fmt(t.setsLineTimed, { sets: st.targetSets }) : fmt(t.setsLine, { sets: st.targetSets, range: range(st.repRange) });
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
