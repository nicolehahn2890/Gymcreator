import { describe, expect, it } from 'vitest';
import { buildPlan } from '../generator/buildPlan';
import { planData } from '../model/data';
import { GOAL_IDS } from '../model/types';
import { dayProgress, estimateMinutes } from './position';
import { shortSets, type ShortRow } from './short';
import { rowState } from './state';
import { context, entry, plans, rowOf } from './testing';

const timing = planData.goals.timing;
const withSets = (rows: readonly ShortRow[], sets: Record<string, number>) => rows.map((r) => ({ ...r, sets: sets[r.slotId] ?? r.sets }));

describe('Kurz-Modus', () => {
  it('kuerzt jeden Fortgeschrittenen-Tag auf die gewaehlte Zeit, alle Uebungen bleiben mit mindestens 1 Satz', () => {
    for (const goal of GOAL_IDS) {
      for (const days of planData.goals.levels.advanced.days) {
        for (const day of buildPlan(planData, { goal, level: 'advanced', days }).dayPlans) {
          for (const minutes of timing.shortMinutes) {
            const sets = shortSets(day.rows, timing, minutes);
            if (!sets) continue;
            const tag = `${goal}/${days}/${day.letter}/${minutes}`;
            expect(Object.keys(sets), tag).toEqual(day.rows.map((r) => r.slotId));
            expect(estimateMinutes(withSets(day.rows, sets), timing), tag).toBeLessThanOrEqual(minutes);
            for (const r of day.rows) expect(sets[r.slotId], tag).toBeGreaterThanOrEqual(1);
            for (const r of day.rows) expect(sets[r.slotId], tag).toBeLessThanOrEqual(r.sets);
          }
        }
      }
    }
  });

  it('nimmt zuerst bei den meisten Saetzen weg, bei Gleichstand bei niedrigerer Prioritaet, dann weiter hinten', () => {
    const rows: ShortRow[] = [
      { slotId: 'a', repRange: '6-8', sets: 4, priority: 3 },
      { slotId: 'b', repRange: '8-12', sets: 3, priority: 2 },
      { slotId: 'c', repRange: '8-12', sets: 3, priority: 3 },
      { slotId: 'd', repRange: '12-15', sets: 3, priority: 3 },
    ];
    // 13 Saetze ~ 40 Min.; fuer 30 Min. fallen 4 Saetze weg: a (4), dann b (Prio 2), dann d (spaeter), dann c
    expect(estimateMinutes(rows, timing)).toBe(40);
    expect(shortSets(rows, timing, 30)).toEqual({ a: 3, b: 2, c: 2, d: 2 });
  });

  it('null, wenn der Tag schon kurz genug ist oder es auch mit einem Satz je Uebung nicht reicht', () => {
    const day = buildPlan(planData, { goal: 'apfel', level: 'beginner', days: 4 }).dayPlans[1];
    if (!day) throw new Error('Tag fehlt');
    expect(estimateMinutes(day.rows, timing)).toBeLessThanOrEqual(30);
    expect(shortSets(day.rows, timing, 30)).toBeNull();
    const advanced = plans[3].dayPlans[0];
    if (!advanced) throw new Error('Tag fehlt');
    expect(shortSets(advanced.rows, timing, 5)).toBeNull();
  });

  it('Einsteiger-Tage sind so kurz, dass 45 Min. nie gebraucht werden', () => {
    for (const goal of GOAL_IDS) {
      for (const days of planData.goals.levels.beginner.days) {
        for (const day of buildPlan(planData, { goal, level: 'beginner', days }).dayPlans) expect(shortSets(day.rows, timing, 45)).toBeNull();
      }
    }
  });

  it('fertig ist eine Uebung im Kurz-Modus mit der gekuerzten Satzzahl; der Vergleich bleibt', () => {
    const row = rowOf('gmax_6-8_a');
    const data = [entry(1, 1, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8, 8, 7]), entry(1, 2, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8, 8])];
    const normal = rowState(context(data), row, { cycle: 1, week: 2 });
    expect(normal).toMatchObject({ totalSets: 3, targetSets: 3, done: false });
    const short = rowState({ ...context(data), short: { 'gmax_6-8_a': 2 } }, row, { cycle: 1, week: 2 });
    expect(short).toMatchObject({ totalSets: 3, targetSets: 2, done: true, status: 'r' });
    const day = plans[4].dayPlans[row.day];
    if (!day) throw new Error('Tag fehlt');
    expect(dayProgress({ ...context(data), short: { 'gmax_6-8_a': 2 } }, day, { cycle: 1, week: 2 }).done).toBe(1);
  });
});
