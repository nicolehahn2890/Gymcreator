import { describe, expect, it } from 'vitest';
import { planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS, LEVELS } from '../model/types';
import { buildPlan } from './buildPlan';
import { totalSets, validatePlan, weeklyMuscles } from './validate';

const combos = GOAL_IDS.flatMap((goal) => LEVELS.flatMap((level) => DAY_COUNTS.map((days) => ({ goal, level, days }))));

describe('buildPlan', () => {
  it.each(combos)('$goal / $level / $days Tage: alle Grenzen und Wochenziele eingehalten', (req) => {
    const plan = buildPlan(planData, req);
    expect(plan.dayPlans).toHaveLength(req.days);
    expect(validatePlan(planData, plan)).toEqual([]);
  });

  it('ist deterministisch', () => {
    for (const req of combos) expect(buildPlan(planData, req)).toEqual(buildPlan(planData, req));
  });

  it('Wochensaetze wie in docs/wissenschaft.md', () => {
    const expected = {
      advanced: { apfel: [50, 55, 55], sanduhr: [48, 56, 55], vform: [51, 56, 57] },
      beginner: { apfel: [30, 32, 32], sanduhr: [28, 30, 32], vform: [24, 26, 30] },
    };
    for (const level of LEVELS) {
      for (const goal of GOAL_IDS) {
        const got = DAY_COUNTS.map((days) => totalSets(buildPlan(planData, { goal, level, days })));
        expect(got, `${goal}/${level}`).toEqual(expected[level][goal]);
      }
    }
  });

  it('Apfel 3 Tage: Po wellenfoermig 6-8 / 8-12 / 12-15, Wochenvolumen Po 14', () => {
    const plan = buildPlan(planData, { goal: 'apfel', level: 'advanced', days: 3 });
    expect(plan.dayPlans.map((d) => d.rows.find((r) => r.category === 'gmax')?.repRange)).toEqual(['6-8', '8-12', '12-15']);
    expect(weeklyMuscles(planData, plan)).toMatchObject({ gluteMax: 14, gluteMed: 8, hams: 8 });
  });

  it('Hauptmuskelgruppe bekommt bei Fortgeschrittenen mindestens drei Bereiche pro Woche', () => {
    for (const goal of GOAL_IDS) {
      const main = planData.goals.goals[goal].mainCategory;
      for (const days of DAY_COUNTS) {
        const rows = buildPlan(planData, { goal, level: 'advanced', days }).dayPlans.flatMap((d) => d.rows);
        expect(new Set(rows.filter((r) => r.category === main).map((r) => r.repRange)).size, `${goal}/${days}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('gleiche Slot-ID = gleiche Kategorie und Bereich in 3/4/5 Tagen', () => {
    for (const goal of GOAL_IDS) {
      const seen = new Map<string, string>();
      for (const days of DAY_COUNTS) {
        for (const day of buildPlan(planData, { goal, level: 'advanced', days }).dayPlans) {
          for (const row of day.rows) {
            const sig = `${row.category} ${row.repRange}`;
            expect(seen.get(row.slotId) ?? sig, row.slotId).toBe(sig);
            seen.set(row.slotId, sig);
          }
        }
      }
    }
  });

  it('pausierte Slots = Pool minus Woche', () => {
    const plan = buildPlan(planData, { goal: 'vform', level: 'advanced', days: 3 });
    const used = plan.dayPlans.flatMap((d) => d.rows.map((r) => r.slotId));
    expect(plan.paused.length).toBeGreaterThan(0);
    expect(plan.paused.filter((id) => used.includes(id))).toEqual([]);
    expect(new Set([...used, ...plan.paused]).size).toBe(planData.goals.goals.vform.slots.length);
  });

  it('Tage tragen Buchstaben A-E', () => {
    expect(buildPlan(planData, { goal: 'sanduhr', level: 'advanced', days: 5 }).dayPlans.map((d) => d.letter)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('meldet zu viele Uebungen, doppelte Kategorie und verfehlte Wochenziele', () => {
    const plan = buildPlan(planData, { goal: 'apfel', level: 'advanced', days: 3 });
    const dayA = plan.dayPlans[0];
    if (!dayA) throw new Error('kein Tag');
    const extra = { slotId: 'x', category: 'back', repRange: '8-12', sets: 5, priority: 2 as const };
    const broken = { ...plan, dayPlans: [{ ...dayA, rows: [...dayA.rows, extra] }, ...plan.dayPlans.slice(1)] };
    const codes = validatePlan(planData, broken).map((i) => i.code);
    expect(codes).toContain('session-exercises');
    expect(codes).toContain('session-sets');
    expect(codes).toContain('category-day');
    expect(codes).toContain('target');
  });
});

describe('Einsteiger (data/goals.json levels.beginner)', () => {
  const rules = planData.goals.levels.beginner;

  it.each(GOAL_IDS.flatMap((goal) => DAY_COUNTS.map((days) => ({ goal, days }))))('$goal / $days Tage', ({ goal, days }) => {
    const adv = buildPlan(planData, { goal, level: 'advanced', days });
    const beg = buildPlan(planData, { goal, level: 'beginner', days });
    const template = planData.templates.goals[goal][`${days}`].days;

    beg.dayPlans.forEach((day, i) => {
      // feste Satzzahl, ersetzte Bereiche
      for (const row of day.rows) {
        expect(row.sets).toBe(rules.setsPerSlot);
        expect(Object.keys(rules.rangeMap ?? {})).not.toContain(row.repRange);
      }
      // genau die Slots ohne beginner: false, gleiche Reihenfolge und IDs wie bei Fortgeschrittenen
      const dropped = (template[i]?.slots ?? []).flatMap((ref) => (typeof ref !== 'string' && ref.beginner === false ? [ref.id] : []));
      const advIds = adv.dayPlans[i]?.rows.map((r) => r.slotId) ?? [];
      expect(day.rows.map((r) => r.slotId)).toEqual(advIds.filter((id) => !dropped.includes(id)));
    });
    expect(totalSets(beg)).toBeLessThan(totalSets(adv));
  });
});
