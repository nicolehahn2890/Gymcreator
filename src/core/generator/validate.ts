// Prueft einen erzeugten Plan gegen data/goals.json: Grenzen (limits: Dauer jeder Einheit, Saetze je Muskel und
// Einheit, Zeilen je Kategorie und Tag, Haeufigkeit und Mindestvolumen der Prio-3-Muskeln), Wochenziele je Muskel
// (targets) und Prioritaeten. Eine feste Obergrenze fuer Saetze oder Uebungen je Einheit gibt es nicht (docs/wissenschaft.md).
import type { Plan, PlanData, PlanIssue, PlanRow, Timing } from '../model/types';

export function validatePlan(data: PlanData, plan: Plan): PlanIssue[] {
  const { limits, categories, ranges } = data.goals;
  const goalDef = data.goals.goals[plan.goal];
  const targets = goalDef.targets;
  const tag = `${plan.goal}/${plan.days}`;
  const issues: PlanIssue[] = [];
  const error = (code: string, message: string) => issues.push({ level: 'error', code, message: `${tag} ${message}` });

  const frequency = new Map<string, Set<number>>();

  for (const day of plan.dayPlans) {
    const minutes = estimateMinutes(day.rows, data.goals.timing);
    const [minMinutes, maxMinutes] = limits.sessionMinutes;
    if (minutes < minMinutes || minutes > maxMinutes) error('session-minutes', `${day.name}: ca. ${minutes} Min. (${minMinutes}-${maxMinutes})`);

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
    // Muskeln, die die Kategorie direkt trainiert (Anteil 1), z. B. chest -> Brust, nicht Trizeps
    if (priority === 3) {
      for (const [muscle, share] of Object.entries(categories[cat]?.muscles ?? {})) {
        const value = weekly[muscle] ?? 0;
        if (share === 1 && value < limits.minWeeklySetsPrio3) error('prio3-volume', `Prio-3-Kategorie ${cat}: ${muscle} ${value} < ${limits.minWeeklySetsPrio3} anteilige Saetze pro Woche`);
      }
    }
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

type Timed = Pick<PlanRow, 'sets' | 'repRange'>;

/**
 * Dauer einer Einheit (timing): je Satz Satzdauer und Pause des Bereichs, je Uebung Aufwaermsaetze und Wechsel
 * (schwere Bereiche brauchen mehr Aufwaermsaetze). Zeilen mit 0 Saetzen (Kurz-Modus: ausgelassen) zaehlen nicht.
 */
export function estimateSeconds(rows: readonly Timed[], timing: Timing): number {
  return rows.reduce(
    (sum, r) => (r.sets > 0 ? sum + r.sets * (timing.setSeconds + (timing.restSeconds[r.repRange] ?? 0)) + (timing.exerciseSeconds[r.repRange] ?? 0) : sum),
    0,
  );
}

/** Geschaetzte Dauer in Minuten, auf 5 gerundet (so wird sie angezeigt und geprueft). */
export function estimateMinutes(rows: readonly Timed[], timing: Timing): number {
  return Math.max(5, Math.round(estimateSeconds(rows, timing) / 300) * 5);
}
