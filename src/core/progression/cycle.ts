// Uebernahme der Uebungsauswahl in einen neuen Zyklus. Port aus Peach (carryMap), vereinfacht durch Slot-IDs:
// 1. gleiche Slot-ID im zuletzt trainierten Zyklus davor (Kategorie muss passen),
// 2. sonst eine Uebung derselben Kategorie aus diesem Zyklus, erst gleicher Bereich, dann beliebig,
//    bevorzugt vom selben Tag; pro Tag keine Uebung doppelt.
// Massgeblich ist die feste Uebung der Zeile ("nur diese Woche" zaehlt nicht). Nur Vorbelegung, gespeichert
// wird erst beim Eintragen. Zeilen mit eigener Auswahl im Zielzyklus bleiben, ihre Uebungen gelten als vergeben.
import type { CategoryId, Entry, Plan } from '../model/types';
import { baseExercise } from './entries';

interface Latest {
  week: number;
  exerciseId: string;
  entry: Entry;
}

export function carryOver(
  entries: Iterable<Entry>,
  cycle: number,
  plan: Plan,
  categoryOf: (exerciseId: string) => CategoryId | undefined,
): Record<string, string> {
  const byCycle = new Map<number, Map<string, Latest>>();
  for (const e of entries) {
    const exerciseId = baseExercise(e);
    if (!exerciseId) continue;
    const slots = byCycle.get(e.cycle) ?? new Map<string, Latest>();
    byCycle.set(e.cycle, slots);
    const known = slots.get(e.slotId);
    if (!known || known.week < e.week) slots.set(e.slotId, { week: e.week, exerciseId, entry: e });
  }
  const earlier = [...byCycle.keys()].filter((c) => c < cycle);
  if (!earlier.length) return {};
  const source = byCycle.get(Math.max(...earlier)) ?? new Map<string, Latest>();
  const own = byCycle.get(cycle) ?? new Map<string, Latest>();
  const pool = [...source.values()]
    .map((l) => ({ exerciseId: l.exerciseId, category: categoryOf(l.exerciseId), range: l.entry.repRange, day: l.entry.day }))
    .sort((a, b) => a.day - b.day);

  const result: Record<string, string> = {};
  for (const day of plan.dayPlans) {
    const used = new Set<string>();
    const open = day.rows.filter((row) => {
      const mine = own.get(row.slotId);
      if (mine) used.add(mine.exerciseId);
      return !mine;
    });
    for (const row of open) {
      const hit = source.get(row.slotId);
      if (hit && !used.has(hit.exerciseId) && categoryOf(hit.exerciseId) === row.category) {
        result[row.slotId] = hit.exerciseId;
        used.add(hit.exerciseId);
      }
    }
    for (const exact of [true, false]) {
      for (const row of open) {
        if (result[row.slotId]) continue;
        let best: (typeof pool)[number] | undefined;
        let bestScore = -1;
        for (const p of pool) {
          if (p.category !== row.category || used.has(p.exerciseId) || (exact && p.range !== row.repRange)) continue;
          const score = p.day === day.index ? 2 : 0;
          if (score > bestScore) {
            bestScore = score;
            best = p;
          }
        }
        if (best) {
          result[row.slotId] = best.exerciseId;
          used.add(best.exerciseId);
        }
      }
    }
  }
  return result;
}
