import { describe, expect, it } from 'vitest';
import { planData } from '../model/data';
import { indexEntries } from './entries';
import { estimateMinutes } from '../generator/validate';
import { dayProgress, followingWeek, latestWeek, nextDayIndex } from './position';
import { context, entry, plans } from './testing';

describe('Position und Dauer', () => {
  const rules = planData.goals.progression;

  it('naechster Tag = erster ohne Eintraege; alle trainiert -> null', () => {
    const data = [entry(1, 2, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8])];
    const ctx = context(data);
    const progress = plans[4].dayPlans.map((d) => dayProgress(ctx, d, { cycle: 1, week: 2 }));
    expect(progress[0]).toMatchObject({ started: true, done: 0 });
    expect(nextDayIndex(progress)).toBe(1);
    expect(nextDayIndex(progress.map((p) => ({ ...p, started: true })))).toBeNull();
  });

  it('eine Uebung mit allen Saetzen zaehlt als erledigt', () => {
    const data = [entry(1, 1, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8, 8, 8])];
    const day = plans[4].dayPlans[0];
    if (!day) throw new Error('Tag fehlt');
    expect(dayProgress(context(data), day, { cycle: 1, week: 1 }).done).toBe(1);
  });

  it('nach der letzten Woche beginnt der naechste Zyklus', () => {
    expect(followingWeek(rules, 1, 3)).toEqual({ cycle: 1, week: 4 });
    expect(followingWeek(rules, 1, rules.cycleWeeks)).toEqual({ cycle: 2, week: 1 });
  });

  it('juengste Woche mit Werten', () => {
    const data = [entry(1, 5, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8]), entry(2, 1, 'gmax_6-8_a', 'hip_thrust_barbell', '', [])];
    expect(latestWeek(indexEntries(data))).toEqual({ cycle: 1, week: 5 });
    expect(latestWeek(indexEntries([]))).toEqual({ cycle: 1, week: 1 });
  });

  it('Dauer-Schaetzung in 5-Minuten-Schritten; Pausen mindestens 90 s, schwere Bereiche laenger', () => {
    const { restSeconds, exerciseSeconds } = planData.goals.timing;
    for (const r of planData.goals.ranges) expect(restSeconds[r], r).toBeGreaterThanOrEqual(90);
    expect(restSeconds['6-8'] ?? 0).toBeGreaterThan(restSeconds['8-12'] ?? 0);
    expect(exerciseSeconds['6-8'] ?? 0).toBeGreaterThan(exerciseSeconds['12-15'] ?? 0);
    for (const day of plans[4].dayPlans) expect(estimateMinutes(day.rows, planData.goals.timing) % 5).toBe(0);
    // 3 x 8-12: 3 x (45 + 120) + 120 = 615 s; ausgelassene Zeilen (0 Saetze) zaehlen nicht
    expect(estimateMinutes([{ sets: 3, repRange: '8-12' }, { sets: 0, repRange: '6-8' }], planData.goals.timing)).toBe(10);
  });
});
