// Progressionsregeln. Port aus Peach (autoExtraSets), plus Gewichtsvorschlag (neu).
import type { ProgressionRules } from '../model/types';
import { progressStatus } from './compare';
import { getEntry, hasReps, hasValues, performanceOf, type EntryIndex } from './entries';
import { parseWeight } from './weight';

/**
 * Auto-Zusatzsatz (Peach 1:1): die letzten `stagnationComparisons` Wochenvergleiche derselben Zeile
 * mit derselben Uebung waren gleich oder schlechter -> `autoExtraSets` Saetze mehr. Eine Woche ohne
 * Uebung, ohne Vorwoche oder mit anderer Uebung bricht die Serie ab. Fruehestens in Woche stagnationComparisons + 2.
 */
export function autoExtraSets(
  index: EntryIndex,
  rules: ProgressionRules,
  isAssisted: (exerciseId: string) => boolean,
  q: { cycle: number; week: number; slotId: string },
): number {
  let streak = 0;
  for (let w = q.week - 1; w >= Math.max(1, q.week - rules.stagnationComparisons); w--) {
    const cur = getEntry(index, q.cycle, w, q.slotId);
    const prev = getEntry(index, q.cycle, w - 1, q.slotId);
    if (!cur?.exerciseId || !prev?.exerciseId || cur.exerciseId !== prev.exerciseId) break;
    if (!hasValues(prev) || !hasReps(cur.sets)) break;
    const status = progressStatus(performanceOf(cur.sets), performanceOf(prev.sets), isAssisted(cur.exerciseId));
    if (status === 's' || status === 'd') streak++;
    else break;
  }
  return streak >= rules.stagnationComparisons ? rules.autoExtraSets : 0;
}

/**
 * Konkreter Vorschlag fuer heute: Bestwert der letzten Angabe plus Schrittweite (assistiert: minus).
 * null, wenn es keine Schrittweite gibt (Maschine = eine Stufe) oder kein Gewicht vorliegt.
 */
export function suggestWeight(previousWeight: string, increment: number | null, assisted = false): number | null {
  if (increment === null || increment <= 0) return null;
  const base = parseWeight(previousWeight, assisted);
  if (base <= 0) return null;
  const next = assisted ? Math.max(0, base - increment) : base + increment;
  return Math.round(next * 100) / 100;
}
