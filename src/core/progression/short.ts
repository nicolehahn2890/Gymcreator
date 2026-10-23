// Kurz-Modus (Nicoles Vorgabe): die short.exercises wichtigsten Uebungen eines Tages fuers Ziel, mit allen Saetzen
// und normalen Pausen, in hoechstens short.minutes[1] Minuten laut Schaetzung. Ohne Supersaetze.
// Wichtigkeit: 1. Prioritaet der Muskelgruppe fuers Ziel, 2. wie stark die Uebung die Zielmuskeln mittrainiert
// (z. B. Kniebeuge den Po), 3. Grunduebung vor Isolation, 4. Reihenfolge im Tag.
// Die Uebungen fuers Ziel (Prio 3) bleiben alle; die uebrigen Plaetze bekommen die wichtigsten weiteren Uebungen,
// die zusammen in die Zeit passen. Passen nicht so viele, werden es weniger.
import { estimateMinutes } from '../generator/validate';
import type { CategoryDef, PlanDay, PlanRow, Priority, RepRange, ShortRules, ShortSlot, Timing } from '../model/types';

export type ShortRow = Pick<PlanRow, 'slotId' | 'category' | 'repRange' | 'sets' | 'priority'>;

export interface ShortContext {
  timing: Timing;
  rules: ShortRules;
  /** Bereiche, schwerster zuerst (data/goals.json ranges). */
  ranges: readonly RepRange[];
  categories: Record<string, Pick<CategoryDef, 'muscles'>>;
  /** Prioritaeten des gewaehlten Ziels je Muskelgruppe. */
  priorities: Record<string, Priority>;
}

/** Erste Auswahl von n Eintraegen in Rangfolge (also die wichtigste), fuer die ok gilt; null, wenn es keine gibt. */
function firstPick<T>(items: readonly T[], n: number, ok: (pick: T[]) => boolean, start = 0, pick: T[] = []): T[] | null {
  if (pick.length === n) return ok(pick) ? pick : null;
  for (let i = start; i <= items.length - (n - pick.length); i++) {
    const item = items[i];
    if (item === undefined) continue;
    const found = firstPick(items, n, ok, i + 1, [...pick, item]);
    if (found) return found;
  }
  return null;
}

/**
 * Saetze je Slot im Kurz-Modus: volle Saetze fuer die gewaehlten Uebungen, 0 fuer die heute ausgelassenen.
 * null, wenn der Tag nicht mehr Uebungen hat, als die Kurz-Fassung behaelt.
 */
export function shortSets(rows: readonly ShortRow[], ctx: ShortContext): Record<string, number> | null {
  const { rules, ranges, categories, priorities } = ctx;
  if (rows.length <= rules.exercises) return null;
  // Prioritaet eines Muskels = hoechste Prioritaet der Muskelgruppen, die ihn direkt trainieren
  const musclePriority: Record<string, number> = {};
  for (const [cat, def] of Object.entries(categories)) {
    for (const [m, share] of Object.entries(def.muscles)) if (share === 1) musclePriority[m] = Math.max(musclePriority[m] ?? 0, priorities[cat] ?? 0);
  }
  const goalWeight = (r: ShortRow) => Object.entries(categories[r.category]?.muscles ?? {}).reduce((sum, [m, share]) => sum + share * (musclePriority[m] ?? 0), 0);
  const ranked = rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.priority - a.r.priority || goalWeight(b.r) - goalWeight(a.r) || ranges.indexOf(a.r.repRange) - ranges.indexOf(b.r.repRange) || a.i - b.i)
    .map((x) => x.r);
  const fits = (pick: readonly ShortRow[]) => estimateMinutes(pick, ctx.timing) <= rules.minutes[1];
  const goal = ranked.filter((r) => r.priority === 3);
  const others = ranked.filter((r) => r.priority < 3);

  for (let n = rules.exercises; n > 0; n--) {
    const must = goal.slice(0, n);
    const extra = firstPick(others, n - must.length, (pick) => fits([...must, ...pick]));
    if (!extra) continue;
    const keep = new Set([...must, ...extra].map((r) => r.slotId));
    return Object.fromEntries(rows.map((r) => [r.slotId, keep.has(r.slotId) ? r.sets : 0]));
  }
  return null;
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
