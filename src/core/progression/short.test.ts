import { describe, expect, it } from 'vitest';
import { buildPlan } from '../generator/buildPlan';
import { estimateMinutes, weeklyMuscles } from '../generator/validate';
import { planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS, type GoalId, type PlanRow } from '../model/types';
import { dayProgress } from './position';
import { carryShort, shortSets, shortTiming, type ShortContext } from './short';
import { rowState } from './state';
import { context, entry, plans, rowOf } from './testing';

const g = planData.goals;
const ctxFor = (goal: GoalId): ShortContext => ({ timing: g.timing, rules: g.short, ranges: g.ranges, categories: g.categories, targets: g.goals[goal].targets });
const { minExercises, minSets } = g.short;
const [SHORT] = g.short.minutes;
const withSets = (rows: readonly PlanRow[], sets: Record<string, number>) => rows.map((r) => ({ ...r, sets: sets[r.slotId] ?? r.sets }));
const allDays = GOAL_IDS.flatMap((goal) =>
  DAY_COUNTS.flatMap((days) => {
    const plan = buildPlan(planData, { goal, days });
    return plan.dayPlans.map((day) => ({ tag: `${goal}/${days}/${day.letter}`, goal, day, weekly: weeklyMuscles(planData, plan) }));
  }),
);
/** Kurz-Fassung eines Tages aus einem echten Plan. */
const shortOf = (goal: GoalId, days: 3 | 4 | 5, letter: string) => {
  const plan = buildPlan(planData, { goal, days });
  const day = plan.dayPlans.find((d) => d.letter === letter);
  if (!day) throw new Error('Tag fehlt');
  return { day, sets: shortSets(day.rows, ctxFor(goal), SHORT ?? 0, weeklyMuscles(planData, plan)) };
};

describe('Kurz-Modus', () => {
  it('eine deutlich kuerzere Fassung (45 Min.), keine, die kaum kuerzer ist', () => {
    expect(g.short.minutes).toEqual([45]);
    for (const { day } of allDays) expect(estimateMinutes(day.rows, g.timing) - (SHORT ?? 0), day.name).toBeGreaterThanOrEqual(15);
  });

  it('Pausen im Kurz-Modus kuerzer als normal, nie unter 90 s', () => {
    for (const range of g.ranges) {
      expect(g.short.restSeconds[range], range).toBeLessThanOrEqual(g.timing.restSeconds[range] ?? 0);
      expect(g.short.restSeconds[range], range).toBeGreaterThanOrEqual(90);
    }
  });

  it('jede Einheit: passt in die Zeit, Prio 3 bleibt mit allen Saetzen, Mindestdosis bleibt, nichts kommt dazu', () => {
    for (const { tag, goal, day, weekly } of allDays) {
      const ctx = ctxFor(goal);
      const sets = shortSets(day.rows, ctx, SHORT ?? 0, weekly);
      expect(sets, tag).not.toBeNull();
      if (!sets) continue;
      expect(Object.keys(sets), tag).toEqual(day.rows.map((r) => r.slotId));
      expect(estimateMinutes(withSets(day.rows, sets), shortTiming(ctx)), tag).toBeLessThanOrEqual(SHORT ?? 0);
      const kept = day.rows.filter((r) => (sets[r.slotId] ?? 0) > 0);
      expect(kept.length, tag).toBeGreaterThanOrEqual(minExercises);
      for (const r of day.rows) {
        const n = sets[r.slotId] ?? 0;
        expect(n, `${tag} ${r.slotId}`).toBeLessThanOrEqual(r.sets);
        if (n > 0) expect(n, `${tag} ${r.slotId}`).toBeGreaterThanOrEqual(Math.min(minSets, r.sets));
        if (r.priority === 3) expect(n, `${tag} ${r.slotId}`).toBe(r.sets);
      }
    }
  });

  it('Wochenblick: derselbe Tag behaelt Glute Med, wenn die Woche ihn braucht, und laesst ihn weg, wenn ein anderer Tag ihn abdeckt', () => {
    // Sanduhr Tag A ist mit 3 und 4 Tagen gleich; Glute Med: Wochenziel ab 4 Saetzen, 3 Tage = 4, 4 Tage = 6
    const three = shortOf('sanduhr', 3, 'A');
    const four = shortOf('sanduhr', 4, 'A');
    expect(three.day.rows.map((r) => r.slotId)).toEqual(four.day.rows.map((r) => r.slotId));
    expect(three.sets?.['gmed_8-12_a']).toBe(2);
    expect(four.sets?.['gmed_8-12_a']).toBe(0);
  });

  it('Beispiel Apfel 3 Tage, Tag A (70 Min.): Po, Beine und Ruecken bleiben, Adduktoren, Seitheben und Bauch deckt die Woche', () => {
    const { day, sets } = shortOf('apfel', 3, 'A');
    expect(estimateMinutes(day.rows, g.timing)).toBe(70);
    expect(sets).toEqual({ 'gmax_6-8_a': 3, 'gquad_6-10_a': 3, 'gmed_8-12_a': 3, 'add_8-12_a': 0, 'back_6-10_a': 3, 'shoulders_12-15_b': 0, 'abs_8-12_a': 0 });
  });

  it('uebrige Zeit holt eine weggefallene Uebung mit 2 Saetzen zurueck', () => {
    // V-Form 3 Tage, Tag C: ohne Bauch und RDL waeren es nur 35 Min.
    const { sets } = shortOf('vform', 3, 'C');
    expect(sets).toMatchObject({ 'ghams_6-10_a': 2, 'abs_8-12_c': 0 });
  });

  it('kuerzt Saetze erst, wenn nur noch Prio-3-Uebungen da sind, und nie unter 2', () => {
    const rows: PlanRow[] = [
      { slotId: 'a', category: 'back', repRange: '6-8', sets: 4, priority: 3 },
      { slotId: 'b', category: 'chest', repRange: '6-8', sets: 4, priority: 3 },
      { slotId: 'c', category: 'shoulders', repRange: '8-12', sets: 4, priority: 3 },
      { slotId: 'd', category: 'abs', repRange: '8-12', sets: 2, priority: 2 },
    ];
    const ctx = ctxFor('vform');
    const weekly = { back: 12, chest: 10, shoulders: 10, abs: 6 };
    expect(estimateMinutes(rows, g.timing)).toBe(60);
    // erst Bauch weg (Prio 2, die Woche hat genug), dann je ein Satz bei den Uebungen mit den meisten Saetzen, Isolation zuerst
    expect(shortSets(rows, ctx, 40, weekly)).toEqual({ a: 4, b: 3, c: 3, d: 0 });
    expect(shortSets(rows, ctx, 20, weekly)).toBeNull();
  });

  it('null, wenn der Tag schon kurz genug ist', () => {
    const day = plans[3].dayPlans[0];
    if (!day) throw new Error('Tag fehlt');
    expect(shortSets(day.rows, ctxFor('apfel'), 90, weeklyMuscles(planData, plans[3]))).toBeNull();
  });

  it('Umstellen der Wochenart: Kurz-Modus bleibt nur fuer Tage mit denselben Slots', () => {
    const [three, four, five] = DAY_COUNTS.map((days) => buildPlan(planData, { goal: 'apfel', days }).dayPlans);
    const dayA = four?.[0];
    const sets = dayA && shortSets(dayA.rows, ctxFor('apfel'), SHORT ?? 0, weeklyMuscles(planData, plans[4]));
    if (!three || !four || !five || !sets) throw new Error('Plan fehlt');
    const short = Object.fromEntries(Object.entries(sets).map(([slotId, n]) => [slotId, { minutes: SHORT ?? 0, sets: n }]));
    // Apfel Tag A ist mit 4 und 5 Tagen gleich, mit 3 Tagen ein anderer Tag
    expect(carryShort(short, four, five)).toEqual(short);
    expect(carryShort(short, four, three)).toBeUndefined();
    expect(carryShort(undefined, four, five)).toBeUndefined();
  });

  it('fertig zaehlt mit der gekuerzten Satzzahl; ausgelassene Uebungen zaehlen im Tag nicht, ausser sie werden eingetragen', () => {
    const row = rowOf('gmax_6-8_a');
    const data = [entry(1, 1, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8, 8, 7]), entry(1, 2, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8, 8])];
    expect(rowState(context(data), row, { cycle: 1, week: 2 })).toMatchObject({ totalSets: 3, targetSets: 3, done: false, skipped: false });
    expect(rowState({ ...context(data), short: { 'gmax_6-8_a': 2 } }, row, { cycle: 1, week: 2 })).toMatchObject({ targetSets: 2, done: true });

    const day = plans[4].dayPlans[row.day];
    if (!day) throw new Error('Tag fehlt');
    const skipAll = Object.fromEntries(day.rows.filter((r) => r.slotId !== 'gmax_6-8_a').map((r) => [r.slotId, 0]));
    const skipped = { ...context(data), short: { ...skipAll, 'gmax_6-8_a': 2 } };
    expect(dayProgress(skipped, day, { cycle: 1, week: 2 })).toEqual({ done: 1, total: 1, started: true });
    const other = day.rows.find((r) => r.slotId !== 'gmax_6-8_a');
    if (!other) throw new Error('Zeile fehlt');
    expect(rowState(skipped, other, { cycle: 1, week: 2 })).toMatchObject({ skipped: true, targetSets: other.sets, done: false });
  });
});
