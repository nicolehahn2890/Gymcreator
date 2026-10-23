// Zustand einer Plan-Zeile an EINER Stelle: Uebung, Saetze, Vorwert, Badge, Steigerungs-Hinweis, Haken.
// Port aus Peach (exState, exDone, incCand/incDue, weekStats). Badge, Hinweis und Wochenbilanz koennen
// so nicht auseinanderlaufen.
import type { Limits, PlanDay, PlanRow, ProgressionRules, RepRange, SetValue } from '../model/types';
import { progressStatus, type ProgressStatus } from './compare';
import { combinedWeight, getEntry, hasValues, performanceOf, type EntryIndex } from './entries';
import { findPrevious, type PreviousResult } from './history';
import { inheritExercise, inheritExtraSets } from './inherit';
import { autoExtraSets } from './rules';
import { cmpWeight, parseWeight } from './weight';

export interface RowContext {
  index: EntryIndex;
  limits: Limits;
  rules: ProgressionRules;
  isAssisted: (exerciseId: string) => boolean;
  /** Aus dem Zyklus davor uebernommene Uebung (carryOver), falls vorhanden. */
  carried: (slotId: string) => string | undefined;
  /** Kurz-Modus dieser Woche: gekuerzte Satzzahl je Slot-ID. */
  short?: Record<string, number>;
}

export interface RowState {
  slotId: string;
  /** Eintrag dieser Woche ist gespeichert (sonst Vorbelegung). */
  stored: boolean;
  exerciseId: string;
  /** Vererbte Uebung (fruehere Woche oder Vorzyklus); Grundlage fuer die Wechsel-Rueckfrage. */
  inheritedExerciseId: string | undefined;
  once: boolean;
  repRange: RepRange;
  baseSets: number;
  extraSets: number;
  autoExtra: number;
  totalSets: number;
  /** Saetze fuer "fertig": im Kurz-Modus weniger, die uebrigen sind freiwillig. */
  targetSets: number;
  sets: SetValue[];
  weight: string;
  previous: PreviousResult | null;
  /** Woche ohne Vergleich (Einstieg) oder Vorwert aus anderem Bereich. */
  noCompare: boolean;
  status: ProgressStatus | null;
  done: boolean;
  assisted: boolean;
  increaseDue: boolean;
}

function filledCount(sets: SetValue[]): number {
  return sets.filter((s) => s.r !== null && s.r > 0).length;
}

export function rowState(ctx: RowContext, row: PlanRow, q: { cycle: number; week: number }): RowState {
  const at = { ...q, slotId: row.slotId };
  const raw = getEntry(ctx.index, q.cycle, q.week, row.slotId);
  const inherited = inheritExercise(ctx.index, at) ?? ctx.carried(row.slotId);
  // Keine Vorgabe: ohne eigene Wahl, Vorwoche oder Vorzyklus bleibt die Zeile leer
  const exerciseId = raw ? raw.exerciseId : (inherited ?? '');
  const extraSets = raw ? raw.extraSets : inheritExtraSets(ctx.index, at);
  // Bereich und Basis-Saetze, mit denen die Woche trainiert wurde, stehen im Eintrag; ohne Werte gilt der Plan
  // (z. B. Uebung gewaehlt, dann Woche von 4 auf 3 Tage umgestellt)
  const trained = raw && hasValues(raw) ? raw : undefined;
  const repRange = trained?.repRange ?? row.repRange;
  const baseSets = trained?.baseSets ?? row.sets;
  const assisted = exerciseId ? ctx.isAssisted(exerciseId) : false;
  const previous = findPrevious(ctx.index, { ...at, exerciseId, repRange });
  const autoExtra = autoExtraSets(ctx.index, ctx.rules, ctx.isAssisted, at);
  const totalSets = Math.min(ctx.limits.maxSetsPerSlot, baseSets + extraSets + autoExtra);
  // Nur die Saetze dieser Woche: ein entfernter Zusatzsatz zaehlt nicht weiter mit
  const sets = (raw?.sets ?? []).slice(0, totalSets);
  const weight = combinedWeight(sets);
  const noCompare = q.week < ctx.rules.compareFromWeek || !!previous?.orientation;
  const short = ctx.short?.[row.slotId];
  const targetSets = short === undefined ? totalSets : Math.min(totalSets, short);
  const done = !!exerciseId && filledCount(sets) >= targetSets;
  const status = noCompare || !previous ? null : progressStatus({ weight, reps: sets.map((s) => s.r) }, performanceOf(previous.entry.sets), assisted);

  // Steigerungsregel: Obergrenze im 1. Satz beim Vorwert aus dieser oder der Vorwoche desselben Zyklus
  // -> diesmal mehr Gewicht. Weg, sobald mehr Gewicht eingetragen oder die Uebung fertig ist.
  let increaseDue = false;
  if (previous && !noCompare) {
    const prev = previous.entry;
    const prevWeight = combinedWeight(prev.sets);
    const firstReps = prev.sets[0]?.r ?? null;
    const top = Number(repRange.split('-')[1]);
    const recent = prev.cycle === q.cycle && prev.week >= q.week - 1;
    // assistiert ohne Hilfe (0 kg) gibt es nichts mehr zu senken
    const floor = assisted && parseWeight(prevWeight, true) <= 0;
    increaseDue = !!prevWeight && !floor && recent && firstReps !== null && firstReps >= top && !done && !(cmpWeight(weight, prevWeight, assisted) > 0);
  }

  return {
    slotId: row.slotId,
    stored: !!raw,
    exerciseId,
    inheritedExerciseId: inherited,
    once: !!raw?.once,
    repRange,
    baseSets,
    extraSets,
    autoExtra,
    totalSets,
    targetSets,
    sets,
    weight,
    previous,
    noCompare,
    status,
    done,
    assisted,
    increaseDue,
  };
}

export interface WeekStats {
  /** Uebungen mit Vergleich und eingetragenen Wiederholungen. */
  total: number;
  /** davon gesteigert (mehr Gewicht oder mehr Wiederholungen). */
  improved: number;
  pct: number;
}

export function weekStats(ctx: RowContext, days: PlanDay[], q: { cycle: number; week: number }): WeekStats {
  let total = 0;
  let improved = 0;
  for (const day of days) {
    for (const row of day.rows) {
      const st = rowState(ctx, row, q);
      if (!st.exerciseId || !st.previous || st.noCompare || filledCount(st.sets) === 0) continue;
      total++;
      if (st.status === 'w' || st.status === 'r') improved++;
    }
  }
  return { total, improved, pct: total ? Math.round((improved / total) * 100) : 0 };
}
