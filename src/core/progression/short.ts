// Kurz-Modus: ein Tag in kuerzerer Zeit, ohne dass vom Training zu wenig uebrig bleibt.
// 1. Ganze Uebungen fallen weg: niedrigste Prioritaet fuers Ziel zuerst, bei Gleichstand Isolation (leichterer
//    Bereich) vor Grunduebung, dann die spaetere. Prio-3-Uebungen bleiben immer.
// 2. Reicht das nicht, bekommen die verbleibenden Uebungen weniger Saetze: die mit den meisten zuerst.
// Es bleiben mindestens short.minExercises Uebungen mit je mindestens short.minSets Saetzen. Geht die Zeit damit
// nicht, gibt es fuer sie kein Kurz-Training (null). Begruendung: docs/wissenschaft.md, Kurz-Modus.
import { estimateMinutes } from '../generator/validate';
import type { PlanRow, RepRange, ShortRules, Timing } from '../model/types';

export type ShortRow = Pick<PlanRow, 'slotId' | 'repRange' | 'sets' | 'priority'>;

export interface ShortContext {
  timing: Timing;
  rules: ShortRules;
  /** Bereiche, schwerster zuerst (data/goals.json ranges). */
  ranges: readonly RepRange[];
}

/** Saetze je Slot fuer hoechstens `minutes` (0 = heute ausgelassen) oder null, wenn es kein sinnvolles Kurz-Training gibt. */
export function shortSets(rows: readonly ShortRow[], ctx: ShortContext, minutes: number): Record<string, number> | null {
  const { timing, rules, ranges } = ctx;
  if (estimateMinutes(rows, timing) <= minutes) return null;
  const work = rows.map((r, i) => ({ ...r, i }));
  const fits = () => estimateMinutes(work, timing) <= minutes;
  const kept = () => work.filter((r) => r.sets > 0).length;
  const lightness = (r: RepRange) => ranges.indexOf(r);

  const droppable = work
    .filter((r) => r.priority < 3)
    .sort((a, b) => a.priority - b.priority || lightness(b.repRange) - lightness(a.repRange) || b.i - a.i);
  for (const r of droppable) {
    if (fits() || kept() <= rules.minExercises) break;
    r.sets = 0;
  }

  while (!fits()) {
    const pick = work
      .filter((r) => r.sets > rules.minSets)
      .sort((a, b) => b.sets - a.sets || a.priority - b.priority || lightness(b.repRange) - lightness(a.repRange) || b.i - a.i)[0];
    if (!pick) return null;
    pick.sets -= 1;
  }
  if (kept() < rules.minExercises) return null;
  return Object.fromEntries(work.map((r) => [r.slotId, r.sets]));
}
