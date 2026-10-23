// Plan-Generator: Wochenvorlage + Slot-Pool -> Tage mit Zeilen in Trainingsreihenfolge.
// Reine Funktion, alle Daten kommen als Parameter (data/goals.json, data/templates.json).
import type { DaysPerWeek, GoalId, Plan, PlanData, PlanDay, PlanRow } from '../model/types';

export interface PlanRequest {
  goal: GoalId;
  days: DaysPerWeek;
}

const DAY_LETTERS = 'ABCDEFG';

export function buildPlan(data: PlanData, { goal, days }: PlanRequest): Plan {
  const goalDef = data.goals.goals[goal];
  const template = data.templates.goals[goal]?.[`${days}`];
  if (!goalDef || !template) throw new Error(`Keine Daten fuer ${goal}/${days}`);
  const slotById = new Map(goalDef.slots.map((s) => [s.id, s]));
  const seen = new Set<string>();

  const dayPlans: PlanDay[] = template.days.map((day, index) => {
    const rows = day.slots.flatMap((ref): PlanRow[] => {
      const { id, sets } = typeof ref === 'string' ? { id: ref, sets: undefined } : ref;
      const slot = slotById.get(id);
      if (!slot) throw new Error(`${goal}/${days}: unbekannter Slot ${id}`);
      if (seen.has(id)) throw new Error(`${goal}/${days}: Slot ${id} doppelt in der Woche`);
      seen.add(id);
      const row: PlanRow = {
        slotId: slot.id,
        category: slot.cat,
        repRange: slot.range,
        sets: sets ?? slot.sets,
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
    days,
    dayPlans,
    paused: goalDef.slots.filter((s) => !used.has(s.id)).map((s) => s.id),
  };
}
