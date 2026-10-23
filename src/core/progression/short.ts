// Kurz-Modus: ein Tag in deutlich kuerzerer Zeit (short.minutes), mit dem, was fuer Ziel und Woche am meisten zaehlt.
// Ohne Supersaetze (Nicoles Entscheidung). Schritte:
// 1. Kuerzere Pausen (short.restSeconds, nie unter 90 s; laenger bringt bei Isolation nichts Nachweisbares mehr).
// 2. Ganze Uebungen fallen weg, zuerst die, die die Woche am wenigsten braucht: kleinste Luecke zum Wochenziel
//    (targets, Mindestwert) der direkt trainierten Muskeln, wenn die Uebung heute wegfaellt. Bei Gleichstand
//    niedrigere Prioritaet, Isolation vor Grunduebung, die spaetere. Prio-3-Uebungen bleiben immer.
// 3. Reicht das nicht, bekommen die verbleibenden Uebungen weniger Saetze, unwichtigere zuerst, nie unter minSets.
// 4. Bleibt Zeit uebrig, kommen weggefallene Uebungen mit minSets Saetzen zurueck, die wichtigste zuerst.
// Es bleiben mindestens short.minExercises Uebungen; sonst gibt es fuer die Zeit kein Kurz-Training (null).
// Begruendung: docs/wissenschaft.md, Kurz-Modus.
import { estimateMinutes } from '../generator/validate';
import type { CategoryDef, MuscleTargets, PlanDay, PlanRow, RepRange, ShortRules, ShortSlot, Timing } from '../model/types';

export type ShortRow = Pick<PlanRow, 'slotId' | 'category' | 'repRange' | 'sets' | 'priority'>;

export interface ShortContext {
  timing: Timing;
  rules: ShortRules;
  /** Bereiche, schwerster zuerst (data/goals.json ranges). */
  ranges: readonly RepRange[];
  categories: Record<string, Pick<CategoryDef, 'muscles'>>;
  /** Wochenziele des gewaehlten Ziels. */
  targets: MuscleTargets;
}

/** Zeitrechnung im Kurz-Modus: wie sonst, nur mit den kuerzeren Pausen. */
export function shortTiming(ctx: Pick<ShortContext, 'timing' | 'rules'>): Timing {
  return { ...ctx.timing, restSeconds: ctx.rules.restSeconds };
}

/**
 * Saetze je Slot fuer hoechstens `minutes` (0 = heute ausgelassen) oder null, wenn der Tag schon so kurz ist oder es
 * kein sinnvolles Kurz-Training gibt. `weekly`: anteilige Saetze je Muskel in dieser Woche, mit diesem Tag komplett.
 */
export function shortSets(rows: readonly ShortRow[], ctx: ShortContext, minutes: number, weekly: Readonly<Record<string, number>>): Record<string, number> | null {
  const { rules, ranges, categories, targets } = ctx;
  if (estimateMinutes(rows, ctx.timing) <= minutes) return null;
  const timing = shortTiming(ctx);
  const work = rows.map((r, i) => ({ ...r, i, full: r.sets }));
  const fits = () => estimateMinutes(work, timing) <= minutes;
  const kept = () => work.filter((r) => r.sets > 0).length;
  const lightness = (r: RepRange) => ranges.indexOf(r);
  const muscles = (r: ShortRow) => Object.entries(categories[r.category]?.muscles ?? {});

  // Luecke zum Wochenziel, wenn die Zeile heute (zusaetzlich zu schon weggefallenen) wegfaellt, relativ zum Mindestwert
  const lost: Record<string, number> = {};
  const gap = (r: ShortRow) =>
    Math.max(
      0,
      ...muscles(r)
        .filter(([, share]) => share === 1)
        .map(([m]) => {
          const min = targets[m]?.[0] ?? 0;
          return min > 0 ? (min - ((weekly[m] ?? 0) - (lost[m] ?? 0) - r.sets)) / min : 0;
        }),
    );

  const dropped: typeof work = [];
  while (!fits() && kept() > rules.minExercises) {
    const next = work
      .filter((r) => r.priority < 3 && r.sets > 0)
      .sort((a, b) => gap(a) - gap(b) || a.priority - b.priority || lightness(b.repRange) - lightness(a.repRange) || b.i - a.i)[0];
    if (!next) break;
    for (const [m, share] of muscles(next)) lost[m] = (lost[m] ?? 0) + next.sets * share;
    next.sets = 0;
    dropped.push(next);
  }

  while (!fits()) {
    const pick = work
      .filter((r) => r.sets > rules.minSets)
      .sort((a, b) => a.priority - b.priority || b.sets - a.sets || lightness(b.repRange) - lightness(a.repRange) || b.i - a.i)[0];
    if (!pick) return null;
    pick.sets -= 1;
  }

  for (const r of [...dropped].reverse()) {
    r.sets = Math.min(rules.minSets, r.full);
    if (!fits()) r.sets = 0;
  }
  if (kept() < rules.minExercises) return null;
  return Object.fromEntries(work.map((r) => [r.slotId, r.sets]));
}

/**
 * Kurz-Modus nach dem Umstellen der Wochenart: Er bleibt fuer Tage, die es im neuen Plan genauso gibt (gleiche
 * Slots), und entfaellt fuer alle anderen, denn fuer sie wurde er nicht berechnet.
 */
export function carryShort(short: Record<string, ShortSlot> | undefined, from: readonly PlanDay[], to: readonly PlanDay[]): Record<string, ShortSlot> | undefined {
  if (!short) return undefined;
  const slots = (day: PlanDay) => day.rows.map((r) => r.slotId).sort().join(' ');
  const same = new Set(to.map(slots));
  const kept: Record<string, ShortSlot> = {};
  for (const day of from) {
    if (!same.has(slots(day))) continue;
    for (const r of day.rows) {
      const s = short[r.slotId];
      if (s) kept[r.slotId] = s;
    }
  }
  return Object.keys(kept).length ? kept : undefined;
}
