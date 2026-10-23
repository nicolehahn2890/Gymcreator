import { describe, expect, it } from 'vitest';
import { buildPlan } from '../generator/buildPlan';
import { estimateMinutes } from '../generator/validate';
import { planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS, type PlanRow } from '../model/types';
import { dayProgress } from './position';
import { carryShort, shortSets, type ShortContext } from './short';
import { rowState } from './state';
import { context, entry, plans, rowOf } from './testing';

const ctx: ShortContext = { timing: planData.goals.timing, rules: planData.goals.short, ranges: planData.goals.ranges };
const { minExercises, minSets } = planData.goals.short;
const withSets = (rows: readonly PlanRow[], sets: Record<string, number>) => rows.map((r) => ({ ...r, sets: sets[r.slotId] ?? r.sets }));
const allDays = GOAL_IDS.flatMap((goal) => DAY_COUNTS.flatMap((days) => buildPlan(planData, { goal, days }).dayPlans.map((day) => ({ tag: `${goal}/${days}/${day.letter}`, day }))));

describe('Kurz-Modus', () => {
  it('jede Einheit: kurze Fassung passt in die Zeit, behaelt Prio 3 und die Mindestdosis, laesst zuerst das Unwichtigste weg', () => {
    let offered = 0;
    for (const { tag, day } of allDays) {
      for (const minutes of planData.goals.short.minutes) {
        const sets = shortSets(day.rows, ctx, minutes);
        if (!sets) continue;
        offered++;
        const t = `${tag}/${minutes}`;
        expect(Object.keys(sets), t).toEqual(day.rows.map((r) => r.slotId));
        expect(estimateMinutes(withSets(day.rows, sets), ctx.timing), t).toBeLessThanOrEqual(minutes);
        const kept = day.rows.filter((r) => (sets[r.slotId] ?? 0) > 0);
        const dropped = day.rows.filter((r) => sets[r.slotId] === 0);
        expect(kept.length, t).toBeGreaterThanOrEqual(minExercises);
        for (const r of kept) expect(sets[r.slotId], `${t} ${r.slotId}`).toBeGreaterThanOrEqual(Math.min(minSets, r.sets));
        for (const r of day.rows) expect(sets[r.slotId], `${t} ${r.slotId}`).toBeLessThanOrEqual(r.sets);
        for (const r of dropped) expect(r.priority, `${t} ${r.slotId}`).toBeLessThan(3);
        // keine weggelassene Uebung ist wichtiger als eine verbleibende (Prio 3 zaehlt nicht, sie bleibt immer)
        const keptNot3 = kept.filter((r) => r.priority < 3).map((r) => r.priority);
        if (dropped.length && keptNot3.length) expect(Math.max(...dropped.map((r) => r.priority)), t).toBeLessThanOrEqual(Math.min(...keptNot3));
      }
    }
    expect(offered).toBeGreaterThan(40);
  });

  it('Beispiel Apfel, Tag A (70 Min.): 60 Min. ohne Schultern und Bauch, 45 Min. nur die drei Po- und Beinuebungen mit allen Saetzen', () => {
    const day = plans[3].dayPlans[0];
    if (!day) throw new Error('Tag fehlt');
    expect(estimateMinutes(day.rows, ctx.timing)).toBe(70);
    expect(shortSets(day.rows, ctx, 60)).toEqual({ 'gmax_6-8_a': 3, 'gquad_6-10_a': 3, 'gmed_8-12_a': 3, 'add_8-12_a': 2, 'back_6-10_a': 3, 'shoulders_12-15_b': 0, 'abs_8-12_a': 0 });
    expect(shortSets(day.rows, ctx, 45)).toEqual({ 'gmax_6-8_a': 3, 'gquad_6-10_a': 3, 'gmed_8-12_a': 3, 'add_8-12_a': 0, 'back_6-10_a': 0, 'shoulders_12-15_b': 0, 'abs_8-12_a': 0 });
  });

  it('kuerzt Saetze erst, wenn nur noch Prio-3-Uebungen da sind, und nie unter 2', () => {
    const rows: PlanRow[] = [
      { slotId: 'a', category: 'back', repRange: '6-8', sets: 4, priority: 3 },
      { slotId: 'b', category: 'chest', repRange: '6-8', sets: 4, priority: 3 },
      { slotId: 'c', category: 'shoulders', repRange: '8-12', sets: 4, priority: 3 },
      { slotId: 'd', category: 'abs', repRange: '8-12', sets: 2, priority: 2 },
    ];
    expect(estimateMinutes(rows, ctx.timing)).toBe(60);
    // erst Bauch weg (Prio 2), dann je ein Satz bei den Uebungen mit den meisten Saetzen, Isolation zuerst
    expect(shortSets(rows, ctx, 45)).toEqual({ a: 4, b: 3, c: 3, d: 0 });
    expect(shortSets(rows, ctx, 20)).toBeNull();
  });

  it('Umstellen der Wochenart: Kurz-Modus bleibt nur fuer Tage mit denselben Slots', () => {
    const [three, four, five] = DAY_COUNTS.map((days) => buildPlan(planData, { goal: 'apfel', days }).dayPlans);
    const dayA = four?.[0];
    const sets = dayA && shortSets(dayA.rows, ctx, 45);
    if (!three || !four || !five || !sets) throw new Error('Plan fehlt');
    const short = Object.fromEntries(Object.entries(sets).map(([slotId, n]) => [slotId, { minutes: 45, sets: n }]));
    // Apfel Tag A ist mit 4 und 5 Tagen gleich, mit 3 Tagen ein anderer Tag
    expect(carryShort(short, four, five)).toEqual(short);
    expect(carryShort(short, four, three)).toBeUndefined();
    expect(carryShort(undefined, four, five)).toBeUndefined();
  });

  it('null, wenn der Tag schon kurz genug ist', () => {
    const day = plans[3].dayPlans[0];
    if (!day) throw new Error('Tag fehlt');
    expect(shortSets(day.rows, ctx, 90)).toBeNull();
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
