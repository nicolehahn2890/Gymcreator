// Prueft einen erzeugten Plan gegen die Grenzen aus data/goals.json (limits, priorities, categoryOrder).
import type { Plan, PlanData, PlanIssue } from '../model/types';

export function validatePlan(data: PlanData, plan: Plan): PlanIssue[] {
  const { limits, categories, ranges } = data.goals;
  const goalDef = data.goals.goals[plan.goal];
  const tag = `${plan.goal}/${plan.level}/${plan.days}`;
  const issues: PlanIssue[] = [];
  const error = (code: string, message: string) => issues.push({ level: 'error', code, message: `${tag} ${message}` });
  const warning = (code: string, message: string) => issues.push({ level: 'warning', code, message: `${tag} ${message}` });

  const weekly = new Map<string, number>();
  const frequency = new Map<string, Set<number>>();

  for (const day of plan.dayPlans) {
    if (day.rows.length === 0) error('empty-day', `${day.name}: keine Uebungen`);
    const sessionSets = day.rows.reduce((sum, r) => sum + r.sets, 0);
    if (sessionSets > limits.maxSetsPerSession) error('session-sets', `${day.name}: ${sessionSets} Saetze > ${limits.maxSetsPerSession}`);
    else if (sessionSets > limits.warnSetsPerSession) warning('session-long', `${day.name}: ${sessionSets} Saetze > ${limits.warnSetsPerSession}`);

    const fractional = new Map<string, number>();
    for (const row of day.rows) {
      const cat = categories[row.category];
      if (!cat) {
        error('category', `${day.name}: Kategorie ${row.category} fehlt`);
        continue;
      }
      if (!goalDef.categoryOrder.includes(row.category)) error('order', `${day.name}: ${row.category} fehlt in categoryOrder`);
      if (!ranges.includes(row.repRange)) error('range', `${day.name}: Bereich ${row.repRange} unbekannt`);
      if (row.sets > limits.maxSetsPerSlot) error('slot-sets', `${row.slotId}: ${row.sets} Saetze > ${limits.maxSetsPerSlot}`);
      weekly.set(row.category, (weekly.get(row.category) ?? 0) + row.sets);
      frequency.set(row.category, (frequency.get(row.category) ?? new Set()).add(day.index));
      for (const [muscle, share] of Object.entries(cat.muscles)) fractional.set(muscle, (fractional.get(muscle) ?? 0) + row.sets * share);
    }
    for (const [muscle, value] of fractional) {
      if (value > limits.maxFractionalSetsPerMusclePerSession) {
        error('muscle-session', `${day.name}: ${muscle} ${value} anteilige Saetze > ${limits.maxFractionalSetsPerMusclePerSession}`);
      }
    }
  }

  for (const [cat, priority] of Object.entries(goalDef.priorities)) {
    const times = frequency.get(cat)?.size ?? 0;
    if (priority === 3 && times < limits.minFrequencyPrio3) error('frequency', `Prio-3-Kategorie ${cat} nur ${times}x pro Woche`);
    if (priority === 0 && weekly.get(cat)) error('prio0', `Prio-0-Kategorie ${cat} hat ${weekly.get(cat)} Saetze`);
  }
  return issues;
}

/** Saetze je Kategorie und Woche. */
export function weeklySets(plan: Plan): Record<string, number> {
  const out: Record<string, number> = {};
  for (const day of plan.dayPlans) for (const row of day.rows) out[row.category] = (out[row.category] ?? 0) + row.sets;
  return out;
}

export function totalSets(plan: Plan): number {
  return plan.dayPlans.reduce((sum, d) => sum + d.rows.reduce((s, r) => s + r.sets, 0), 0);
}
