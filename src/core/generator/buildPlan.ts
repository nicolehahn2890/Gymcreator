// Plan-Generator: Slot-Pool + Wochenvorlage + Stufen-Regeln -> Tage mit sortierten Zeilen.
// Reine Funktion, alle Daten kommen als Parameter (data/goals.json, data/templates.json).
import type { DaysPerWeek, GoalId, Level, Plan, PlanData, PlanDay, PlanRow, SlotDef } from '../model/types';

export interface PlanRequest {
  goal: GoalId;
  level: Level;
  days: DaysPerWeek;
}

interface DraftRow {
  slot: SlotDef;
  sets: number;
  dayIndex: number;
  tplOrder: number;
}

const DAY_LETTERS = 'ABCDEFG';

export function buildPlan(data: PlanData, { goal, level, days }: PlanRequest): Plan {
  const goalDef = data.goals.goals[goal];
  const template = data.templates.goals[goal]?.[`${days}`];
  if (!goalDef || !template) throw new Error(`Keine Daten fuer ${goal}/${days}`);
  const rules = data.goals.levels[level];

  const poolIndex = new Map(goalDef.slots.map((s, i) => [s.id, i]));
  const seen = new Set<string>();
  let rows: DraftRow[] = template.days.flatMap((day, dayIndex) =>
    day.slots.map((ref, tplOrder) => {
      const id = typeof ref === 'string' ? ref : ref.id;
      const i = poolIndex.get(id);
      const slot = i === undefined ? undefined : goalDef.slots[i];
      if (!slot) throw new Error(`${goal}/${days}: unbekannter Slot ${id}`);
      if (seen.has(id)) throw new Error(`${goal}/${days}: Slot ${id} doppelt in der Woche`);
      seen.add(id);
      return { slot, sets: typeof ref === 'string' ? slot.sets : ref.sets, dayIndex, tplOrder };
    }),
  );

  // Einsteiger: Kategorien mit vielen Slots verlieren den letzten (Pool-Reihenfolge), aber nur von
  // einem Tag, an dem die Kategorie mehrfach vorkommt - so bleibt die Haeufigkeit pro Woche gleich.
  const dropAt = rules.dropLastSlotFromCategoriesWith;
  if (dropAt) {
    const byCat = new Map<string, DraftRow[]>();
    for (const r of rows) byCat.set(r.slot.cat, [...(byCat.get(r.slot.cat) ?? []), r]);
    const dropped = new Set<string>();
    for (const list of byCat.values()) {
      if (list.length < dropAt) continue;
      const candidates = list.filter((r) => list.some((o) => o !== r && o.dayIndex === r.dayIndex));
      const last = candidates.reduce<DraftRow | undefined>(
        (a, b) => (!a || (poolIndex.get(b.slot.id) ?? 0) > (poolIndex.get(a.slot.id) ?? 0) ? b : a),
        undefined,
      );
      if (last) dropped.add(last.slot.id);
    }
    rows = rows.filter((r) => !dropped.has(r.slot.id));
  }

  const rangeRank = (range: string) => data.goals.ranges.indexOf(range);
  const catRank = (cat: string) => goalDef.categoryOrder.indexOf(cat);

  const dayPlans: PlanDay[] = template.days.map((day, index) => {
    const planRows = rows
      .filter((r) => r.dayIndex === index)
      .map((r) => ({ ...r, range: rules.rangeMap?.[r.slot.range] ?? r.slot.range }))
      .sort((a, b) => catRank(a.slot.cat) - catRank(b.slot.cat) || rangeRank(a.range) - rangeRank(b.range) || a.tplOrder - b.tplOrder)
      .map((r): PlanRow => {
        const row: PlanRow = {
          slotId: r.slot.id,
          category: r.slot.cat,
          repRange: r.range,
          sets: rules.setsPerSlot ?? r.sets,
          priority: goalDef.priorities[r.slot.cat] ?? 0,
        };
        if (r.slot.focus) row.focus = r.slot.focus;
        return row;
      });
    return { index, letter: DAY_LETTERS[index] ?? String(index + 1), name: day.name, focus: day.focus, rows: planRows };
  });

  const used = new Set(rows.map((r) => r.slot.id));
  return {
    version: 1,
    goal,
    level,
    days,
    dayPlans,
    paused: goalDef.slots.filter((s) => !used.has(s.id)).map((s) => s.id),
  };
}
