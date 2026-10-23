// Prueft einen erzeugten Plan gegen data/goals.json: Grenzen (limits), Stufen-Regeln (levels),
// Wochenziele je Muskel (targets) und Prioritaeten.
import type { Plan, PlanData, PlanIssue } from '../model/types';

export function validatePlan(data: PlanData, plan: Plan): PlanIssue[] {
  const { limits, categories, ranges } = data.goals;
  const rules = data.goals.levels[plan.level];
  const goalDef = data.goals.goals[plan.goal];
  const targets = goalDef.targets[plan.level];
  const tag = `${plan.goal}/${plan.level}/${plan.days}`;
  const issues: PlanIssue[] = [];
  const error = (code: string, message: string) => issues.push({ level: 'error', code, message: `${tag} ${message}` });

  const frequency = new Map<string, Set<number>>();

  for (const day of plan.dayPlans) {
    const count = day.rows.length;
    if (count < rules.minExercisesPerSession || count > rules.maxExercisesPerSession) {
      error('session-exercises', `${day.name}: ${count} Uebungen (${rules.minExercisesPerSession}-${rules.maxExercisesPerSession})`);
    }
    const sessionSets = day.rows.reduce((sum, r) => sum + r.sets, 0);
    if (sessionSets > rules.maxSetsPerSession) error('session-sets', `${day.name}: ${sessionSets} Saetze > ${rules.maxSetsPerSession}`);

    const perCategory = new Map<string, number>();
    const fractional = new Map<string, number>();
    for (const row of day.rows) {
      const cat = categories[row.category];
      if (!cat) {
        error('category', `${day.name}: Kategorie ${row.category} fehlt`);
        continue;
      }
      if (!ranges.includes(row.repRange)) error('range', `${day.name}: Bereich ${row.repRange} unbekannt`);
      if (row.sets > limits.maxSetsPerSlot) error('slot-sets', `${row.slotId}: ${row.sets} Saetze > ${limits.maxSetsPerSlot}`);
      perCategory.set(row.category, (perCategory.get(row.category) ?? 0) + 1);
      frequency.set(row.category, (frequency.get(row.category) ?? new Set()).add(day.index));
      for (const [muscle, share] of Object.entries(cat.muscles)) fractional.set(muscle, (fractional.get(muscle) ?? 0) + row.sets * share);
    }
    for (const [cat, n] of perCategory) {
      const max = cat === goalDef.mainCategory ? limits.maxSlotsMainCategoryPerDay : limits.maxSlotsPerCategoryPerDay;
      if (n > max) error('category-day', `${day.name}: ${cat} ${n}x > ${max}`);
    }
    for (const [muscle, value] of fractional) {
      if (value > limits.maxFractionalSetsPerMusclePerSession) {
        error('muscle-session', `${day.name}: ${muscle} ${value} anteilige Saetze > ${limits.maxFractionalSetsPerMusclePerSession}`);
      }
    }
  }

  const weekly = weeklyMuscles(data, plan);
  for (const muscle of Object.keys(weekly)) {
    if (!targets[muscle]) error('target-missing', `${muscle}: kein Wochenziel`);
  }
  for (const [muscle, [min, max]] of Object.entries(targets)) {
    const value = weekly[muscle] ?? 0;
    if (value < min || value > max) error('target', `${muscle}: ${value} anteilige Saetze pro Woche, Ziel ${min}-${max}`);
  }

  for (const [cat, priority] of Object.entries(goalDef.priorities)) {
    const times = frequency.get(cat)?.size ?? 0;
    if (priority === 3 && times < limits.minFrequencyPrio3) error('frequency', `Prio-3-Kategorie ${cat} nur ${times}x pro Woche`);
    if (priority === 0 && times > 0) error('prio0', `Prio-0-Kategorie ${cat} im Plan`);
  }
  return issues;
}

/** Anteilige Saetze je Muskel und Woche (direkt 1, Mitarbeit laut categories[].muscles). */
export function weeklyMuscles(data: PlanData, plan: Plan): Record<string, number> {
  const out: Record<string, number> = {};
  for (const day of plan.dayPlans) {
    for (const row of day.rows) {
      for (const [muscle, share] of Object.entries(data.goals.categories[row.category]?.muscles ?? {})) {
        out[muscle] = (out[muscle] ?? 0) + row.sets * share;
      }
    }
  }
  return out;
}

export function totalSets(plan: Plan): number {
  return plan.dayPlans.reduce((sum, d) => sum + d.rows.reduce((s, r) => s + r.sets, 0), 0);
}
