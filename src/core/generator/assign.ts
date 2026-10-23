// Standard-Uebung je Slot, wenn es noch keine Vorgeschichte gibt. Die Auswahl laeuft ueber den ganzen
// Pool (nicht je Wochenart), damit dieselbe Slot-ID in 3/4/5 Tagen dieselbe Uebung bekommt.
// Nur Uebungen der Kategorie mit vorhandener Ausstattung; Rangfolge: Fokus passt, schwer genug (4-8),
// in der Kategorie noch nicht vergeben, Stern fuer das Ziel, bei Einsteigern gefuehrt (Maschine, Kabel),
// Bibliotheks-Reihenfolge.
import type { Exercise, GoalId, Level, PlanRow } from '../model/types';

export interface AssignOptions {
  goal: GoalId;
  level: Level;
  /** Vorhandene Ausstattung ("Mein Gym"); eine Uebung braucht alle ihre Eintraege. */
  equipment: readonly string[];
  /** Bereich, fuer den eine schwere Uebung noetig ist (der schwerste aus data/goals.json ranges). */
  heavyRange: string;
}

export function assignDefaults(rows: PlanRow[], exercises: Exercise[], opt: AssignOptions): Record<string, string> {
  const available = new Set(opt.equipment);
  const usable = exercises.filter((e) => e.equipment.every((q) => available.has(q)));
  const order = new Map(usable.map((e, i) => [e.id, i]));
  const guidedFirst = opt.level === 'beginner';
  const guided = (e: Exercise) => e.equipment.includes('machine') || e.equipment.includes('cable');
  const usedByCategory = new Map<string, Set<string>>();
  const result: Record<string, string> = {};

  for (const row of rows) {
    const used = usedByCategory.get(row.category) ?? new Set<string>();
    usedByCategory.set(row.category, used);
    const heavy = row.repRange === opt.heavyRange;
    // Kleinere Werte gewinnen, von links nach rechts: Fokus passt, schwer genug, noch unbenutzt, Stern,
    // (Einsteiger) gefuehrt, Bibliotheks-Reihenfolge
    const rank = (e: Exercise): number[] => [
      row.focus && !e.focus.includes(row.focus) ? 1 : 0,
      heavy && !e.heavy ? 1 : 0,
      used.has(e.id) ? 1 : 0,
      e.stars.includes(opt.goal) ? 0 : 1,
      guidedFirst && !guided(e) ? 1 : 0,
      order.get(e.id) ?? 0,
    ];
    const best = usable
      .filter((e) => e.category === row.category)
      .map((e) => ({ e, r: rank(e) }))
      .sort((a, b) => {
        for (let i = 0; i < a.r.length; i++) {
          const d = (a.r[i] ?? 0) - (b.r[i] ?? 0);
          if (d) return d;
        }
        return 0;
      })[0];
    if (best) {
      result[row.slotId] = best.e.id;
      used.add(best.e.id);
    }
  }
  return result;
}
