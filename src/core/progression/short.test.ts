import { describe, expect, it } from 'vitest';
import { buildPlan } from '../generator/buildPlan';
import { estimateMinutes } from '../generator/validate';
import { planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS, type GoalId } from '../model/types';
import { dayProgress } from './position';
import { carryShort, shortSets, type ShortContext } from './short';
import { rowState } from './state';
import { context, entry, plans, rowOf } from './testing';

const g = planData.goals;
const ctxFor = (goal: GoalId): ShortContext => ({ timing: g.timing, rules: g.short, ranges: g.ranges, categories: g.categories, priorities: g.goals[goal].priorities });
const [FROM, TO] = g.short.minutes;
const allDays = GOAL_IDS.flatMap((goal) =>
  DAY_COUNTS.flatMap((days) => buildPlan(planData, { goal, days }).dayPlans.map((day) => ({ tag: `${goal}/${days}/${day.letter}`, goal, day }))),
);
/** Kurz-Fassung eines Tages aus einem echten Plan. */
const shortOf = (goal: GoalId, days: 3 | 4 | 5, letter: string) => {
  const day = buildPlan(planData, { goal, days }).dayPlans.find((d) => d.letter === letter);
  if (!day) throw new Error('Tag fehlt');
  return shortSets(day.rows, ctxFor(goal));
};

describe('Kurz-Modus', () => {
  it('heisst "30-45 Min." und hat 4 Uebungen; jede normale Einheit dauert mindestens 60 Minuten', () => {
    expect([FROM, TO]).toEqual([30, 45]);
    expect(g.short.exercises).toBe(4);
    for (const { tag, day } of allDays) expect(estimateMinutes(day.rows, g.timing), tag).toBeGreaterThanOrEqual(60);
  });

  it('jede Einheit: Zieluebungen (Prio 3) bleiben, alle mit vollen Saetzen und normalen Pausen, hoechstens 45 Min.', () => {
    const three: string[] = [];
    for (const { tag, goal, day } of allDays) {
      const sets = shortSets(day.rows, ctxFor(goal));
      expect(sets, tag).not.toBeNull();
      if (!sets) continue;
      expect(Object.keys(sets), tag).toEqual(day.rows.map((r) => r.slotId));
      const kept = day.rows.filter((r) => (sets[r.slotId] ?? 0) > 0);
      for (const r of kept) expect(sets[r.slotId], `${tag} ${r.slotId}`).toBe(r.sets);
      for (const r of day.rows.filter((x) => x.priority === 3)) expect(sets[r.slotId], `${tag} ${r.slotId}`).toBe(r.sets);
      expect(estimateMinutes(kept, g.timing), tag).toBeLessThanOrEqual(TO ?? 0);
      expect(kept.length, tag).toBeLessThanOrEqual(g.short.exercises);
      if (kept.length < g.short.exercises) three.push(tag);
    }
    // nur dort weniger als 4: Brust, Schultern und Ruecken (alle Prio 3) brauchen zusammen schon 42 Minuten
    expect(three).toEqual(['vform/4/C', 'vform/5/B']);
  });

  it('Beispiel Apfel 3 Tage, Tag A (70 Min.): Po und Beine bleiben, Ruecken, Schultern und Bauch fallen heute weg', () => {
    expect(shortOf('apfel', 3, 'A')).toEqual({ 'gmax_6-8_a': 3, 'gquad_6-10_a': 3, 'gmed_8-12_a': 3, 'add_8-12_a': 2, 'back_6-10_a': 0, 'shoulders_12-15_b': 0, 'abs_8-12_a': 0 });
  });

  it('passen die wichtigsten 4 nicht in die Zeit, kommen leichtere dazu statt eine Zieluebung zu streichen', () => {
    // V-Form 3 Tage, Tag A: Brust und Schultern (Prio 3) bleiben; Kniebeuge oder Trizeps dazu waeren ueber 45 Min.
    expect(shortOf('vform', 3, 'A')).toMatchObject({ 'chest_6-8_a': 4, 'shoulders_6-10_a': 3, 'gquad_6-10_a': 0, 'quads_8-12_a': 2, 'abs_8-12_a': 2 });
  });

  it('null, wenn der Tag nicht mehr Uebungen hat als die Kurz-Fassung', () => {
    const day = plans[3].dayPlans[0];
    if (!day) throw new Error('Tag fehlt');
    expect(shortSets(day.rows.slice(0, 4), ctxFor('apfel'))).toBeNull();
  });

  it('Umstellen der Wochenart: Kurz-Modus bleibt nur fuer Tage mit denselben Slots', () => {
    const [three, four, five] = DAY_COUNTS.map((days) => buildPlan(planData, { goal: 'apfel', days }).dayPlans);
    const dayA = four?.[0];
    const sets = dayA && shortSets(dayA.rows, ctxFor('apfel'));
    if (!three || !four || !five || !sets) throw new Error('Plan fehlt');
    const short = Object.fromEntries(Object.entries(sets).map(([slotId, n]) => [slotId, { minutes: TO ?? 0, sets: n }]));
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
