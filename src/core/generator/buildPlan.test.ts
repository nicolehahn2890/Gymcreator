import { describe, expect, it } from 'vitest';
import { planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS } from '../model/types';
import { buildPlan } from './buildPlan';
import { estimateMinutes, totalSets, validatePlan, weeklyMuscles } from './validate';

const combos = GOAL_IDS.flatMap((goal) => DAY_COUNTS.map((days) => ({ goal, days })));

describe('buildPlan', () => {
  it.each(combos)('$goal / $days Tage: alle Grenzen und Wochenziele eingehalten', (req) => {
    const plan = buildPlan(planData, req);
    expect(plan.dayPlans).toHaveLength(req.days);
    expect(validatePlan(planData, plan)).toEqual([]);
  });

  it('ist deterministisch', () => {
    for (const req of combos) expect(buildPlan(planData, req)).toEqual(buildPlan(planData, req));
  });

  it('jede Einheit dauert laut Schaetzung 60-90 Minuten (limits.sessionMinutes)', () => {
    const [min, max] = planData.goals.limits.sessionMinutes;
    expect([min, max]).toEqual([60, 90]);
    for (const req of combos) {
      for (const day of buildPlan(planData, req).dayPlans) {
        const minutes = estimateMinutes(day.rows, planData.goals.timing);
        expect(minutes, `${req.goal}/${req.days}/${day.letter}`).toBeGreaterThanOrEqual(min);
        expect(minutes, `${req.goal}/${req.days}/${day.letter}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it('Wochensaetze wie in docs/wissenschaft.md', () => {
    const expected = { apfel: [53, 69, 86], sanduhr: [52, 70, 85], vform: [52, 68, 84] };
    for (const goal of GOAL_IDS) expect(DAY_COUNTS.map((days) => totalSets(buildPlan(planData, { goal, days }))), goal).toEqual(expected[goal]);
  });

  it('Apfel 3 Tage: Po wellenfoermig 6-8 / 8-12 / 12-15, Wochenvolumen Po 14,5', () => {
    const plan = buildPlan(planData, { goal: 'apfel', days: 3 });
    expect(plan.dayPlans.map((d) => d.rows.find((r) => r.category === 'gmax')?.repRange)).toEqual(['6-8', '8-12', '12-15']);
    expect(weeklyMuscles(planData, plan)).toMatchObject({ gluteMax: 14.5, gluteMed: 10, hams: 6, quads: 6 });
  });

  it('Hauptmuskelgruppe bekommt mindestens drei Bereiche pro Woche', () => {
    for (const goal of GOAL_IDS) {
      const main = planData.goals.goals[goal].mainCategory;
      for (const days of DAY_COUNTS) {
        const rows = buildPlan(planData, { goal, days }).dayPlans.flatMap((d) => d.rows);
        expect(new Set(rows.filter((r) => r.category === main).map((r) => r.repRange)).size, `${goal}/${days}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('gleiche Slot-ID = gleiche Kategorie und Bereich in 3/4/5 Tagen', () => {
    for (const goal of GOAL_IDS) {
      const seen = new Map<string, string>();
      for (const days of DAY_COUNTS) {
        for (const day of buildPlan(planData, { goal, days }).dayPlans) {
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
    const plan = buildPlan(planData, { goal: 'vform', days: 3 });
    const used = plan.dayPlans.flatMap((d) => d.rows.map((r) => r.slotId));
    expect(plan.paused.length).toBeGreaterThan(0);
    expect(plan.paused.filter((id) => used.includes(id))).toEqual([]);
    expect(new Set([...used, ...plan.paused]).size).toBe(planData.goals.goals.vform.slots.length);
  });

  it('Tage tragen Buchstaben A-E', () => {
    expect(buildPlan(planData, { goal: 'sanduhr', days: 5 }).dayPlans.map((d) => d.letter)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('meldet doppelte Kategorie, zu viele Saetze je Muskel und Einheit und verfehlte Wochenziele', () => {
    const plan = buildPlan(planData, { goal: 'apfel', days: 3 });
    const dayA = plan.dayPlans[0];
    if (!dayA) throw new Error('kein Tag');
    const extra = { slotId: 'x', category: 'back', repRange: '8-12', sets: 5, priority: 2 as const };
    const pump = { slotId: 'z', category: 'gmax', repRange: '12-15', sets: 5, priority: 3 as const };
    const calves = { slotId: 'y', category: 'calves', repRange: '12-15', sets: 2, priority: 0 as const };
    const broken = { ...plan, dayPlans: [{ ...dayA, rows: [...dayA.rows, extra, pump, calves] }, ...plan.dayPlans.slice(1)] };
    const codes = validatePlan(planData, broken).map((i) => i.code);
    expect(codes).toContain('category-day');
    expect(codes).toContain('muscle-session');
    expect(codes).toContain('target');
    expect(codes).toContain('prio0');
  });

  it('meldet zu kurze und zu lange Einheiten', () => {
    const plan = buildPlan(planData, { goal: 'sanduhr', days: 4 });
    const short = { ...plan, dayPlans: plan.dayPlans.map((d) => ({ ...d, rows: d.rows.slice(0, 3) })) };
    expect(validatePlan(planData, short).filter((i) => i.code === 'session-minutes')).toHaveLength(4);
    const long = { ...plan, dayPlans: plan.dayPlans.map((d) => ({ ...d, rows: d.rows.map((r) => ({ ...r, sets: 5 })) })) };
    expect(validatePlan(planData, long).filter((i) => i.code === 'session-minutes').length).toBeGreaterThan(0);
  });

  it('meldet Prio-3-Muskeln unter dem Mindestvolumen', () => {
    expect(planData.goals.limits.minWeeklySetsPrio3).toBe(10);
    const plan = buildPlan(planData, { goal: 'vform', days: 3 });
    const withoutFly = { ...plan, dayPlans: plan.dayPlans.map((d) => ({ ...d, rows: d.rows.filter((r) => r.slotId !== 'chest_12-15_a') })) };
    const issues = validatePlan(planData, withoutFly).filter((i) => i.code === 'prio3-volume');
    expect(issues.map((i) => i.message)).toEqual(['vform/3 Prio-3-Kategorie chest: chest 8 < 10 anteilige Saetze pro Woche']);
  });
});
