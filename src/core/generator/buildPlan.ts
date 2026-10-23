// Plan-Generator: Wochenvorlage + Slot-Pool + Stufen-Regeln -> Tage mit Zeilen in Trainingsreihenfolge.
// Reine Funktion, alle Daten kommen als Parameter (data/goals.json, data/templates.json).
import type { DaysPerWeek, GoalId, Level, Plan, PlanData, PlanDay, PlanRow } from '../model/types';

export interface PlanRequest {
  goal: GoalId;
  level: Level;
  days: DaysPerWeek;
}

const DAY_LETTERS = 'ABCDEFG';

/**
 * Tage pro Woche, die fuer die Stufe gelten. Ein nicht erlaubter Wert (z. B. 5 Tage aus einer alten Woche
 * nach dem Wechsel auf Einsteiger) wird zum naechstkleineren erlaubten.
 */
export function effectiveDays(data: PlanData, level: Level, days: DaysPerWeek): DaysPerWeek {
  const allowed = data.goals.levels[level].days;
  if (allowed.includes(days)) return days;
  return allowed.filter((d) => d < days).at(-1) ?? allowed[0] ?? days;
}

export function buildPlan(data: PlanData, { goal, level, days }: PlanRequest): Plan {
  const goalDef = data.goals.goals[goal];
  const template = data.templates.goals[goal]?.[`${days}`];
  if (!goalDef || !template) throw new Error(`Keine Daten fuer ${goal}/${days}`);
  const rules = data.goals.levels[level];
  const slotById = new Map(goalDef.slots.map((s) => [s.id, s]));
  const seen = new Set<string>();

  const dayPlans: PlanDay[] = template.days.map((day, index) => {
    const rows = day.slots.flatMap((ref): PlanRow[] => {
      const { id, sets, beginner } = typeof ref === 'string' ? { id: ref, sets: undefined, beginner: undefined } : ref;
      const slot = slotById.get(id);
      if (!slot) throw new Error(`${goal}/${days}: unbekannter Slot ${id}`);
      if (seen.has(id)) throw new Error(`${goal}/${days}: Slot ${id} doppelt in der Woche`);
      seen.add(id);
      if (level === 'beginner' && beginner === false) return [];
      const row: PlanRow = {
        slotId: slot.id,
        category: slot.cat,
        repRange: rules.rangeMap?.[slot.range] ?? slot.range,
        sets: rules.setsPerSlot ?? sets ?? slot.sets,
        priority: goalDef.priorities[slot.cat] ?? 0,
      };
      if (slot.focus) row.focus = slot.focus;
      return [row];
    });
    return { index, letter: DAY_LETTERS[index] ?? String(index + 1), name: day.name, focus: day.focus, rows };
  });

  const used = new Set(dayPlans.flatMap((d) => d.rows.map((r) => r.slotId)));
  return {
    version: 1,
    goal,
    level,
    days,
    dayPlans,
    paused: goalDef.slots.filter((s) => !used.has(s.id)).map((s) => s.id),
  };
}
