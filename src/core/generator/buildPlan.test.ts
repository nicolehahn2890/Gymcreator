import { describe, expect, it } from 'vitest';
import { planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS, LEVELS } from '../model/types';
import { buildPlan, effectiveDays } from './buildPlan';
import { estimateMinutes, totalSets, validatePlan, weeklyMuscles } from './validate';

const combos = GOAL_IDS.flatMap((goal) => LEVELS.flatMap((level) => planData.goals.levels[level].days.map((days) => ({ goal, level, days }))));

describe('buildPlan', () => {
  it.each(combos)('$goal / $level / $days Tage: alle Grenzen und Wochenziele eingehalten', (req) => {
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
        expect(minutes, `${req.goal}/${req.level}/${req.days}/${day.letter}`).toBeGreaterThanOrEqual(min);
        expect(minutes, `${req.goal}/${req.level}/${req.days}/${day.letter}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it('Wochensaetze wie in docs/wissenschaft.md', () => {
    const expected = {
      advanced: { apfel: [53, 69, 86], sanduhr: [52, 70, 85], vform: [52, 68, 84] },
      beginner: { apfel: [54, 72], sanduhr: [54, 72], vform: [54, 72] },
    };
    for (const level of LEVELS) {
      for (const goal of GOAL_IDS) {
        const got = planData.goals.levels[level].days.map((days) => totalSets(buildPlan(planData, { goal, level, days })));
        expect(got, `${goal}/${level}`).toEqual(expected[level][goal]);
      }
    }
  });

  it('Apfel 3 Tage: Po wellenfoermig 6-8 / 8-12 / 12-15, Wochenvolumen Po 14,5', () => {
    const plan = buildPlan(planData, { goal: 'apfel', level: 'advanced', days: 3 });
    expect(plan.dayPlans.map((d) => d.rows.find((r) => r.category === 'gmax')?.repRange)).toEqual(['6-8', '8-12', '12-15']);
    expect(weeklyMuscles(planData, plan)).toMatchObject({ gluteMax: 14.5, gluteMed: 10, hams: 6, quads: 6 });
  });

  it('Einsteiger waehlen 3 oder 4 Tage; 5 Tage aus alten Wochen werden 4', () => {
    expect(planData.goals.levels.beginner.days).toEqual([3, 4]);
    expect(planData.goals.levels.advanced.days).toEqual([...DAY_COUNTS]);
    expect(effectiveDays(planData, 'beginner', 5)).toBe(4);
    expect(effectiveDays(planData, 'beginner', 3)).toBe(3);
    expect(effectiveDays(planData, 'advanced', 5)).toBe(5);
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
    const calves = { slotId: 'y', category: 'calves', repRange: '12-15', sets: 2, priority: 0 as const };
    const broken = { ...plan, dayPlans: [{ ...dayA, rows: [...dayA.rows, extra, calves] }, ...plan.dayPlans.slice(1)] };
    const codes = validatePlan(planData, broken).map((i) => i.code);
    expect(codes).toContain('session-exercises');
    expect(codes).toContain('session-sets');
    expect(codes).toContain('category-day');
    expect(codes).toContain('target');
  });

  it('meldet zu kurze Einheiten', () => {
    const plan = buildPlan(planData, { goal: 'sanduhr', level: 'advanced', days: 4 });
    const short = { ...plan, dayPlans: plan.dayPlans.map((d) => ({ ...d, rows: d.rows.slice(0, 3) })) };
    expect(validatePlan(planData, short).filter((i) => i.code === 'session-minutes')).toHaveLength(4);
  });

  it('meldet Prio-3-Muskeln unter dem Mindestvolumen (nur Fortgeschrittene)', () => {
    expect(planData.goals.levels.advanced.minWeeklySetsPrio3).toBe(10);
    expect(planData.goals.levels.beginner.minWeeklySetsPrio3).toBeUndefined();
    const plan = buildPlan(planData, { goal: 'vform', level: 'advanced', days: 3 });
    const withoutFly = { ...plan, dayPlans: plan.dayPlans.map((d) => ({ ...d, rows: d.rows.filter((r) => r.slotId !== 'chest_12-15_a') })) };
    const issues = validatePlan(planData, withoutFly).filter((i) => i.code === 'prio3-volume');
    expect(issues.map((i) => i.message)).toEqual(['vform/advanced/3 Prio-3-Kategorie chest: chest 8 < 10 anteilige Saetze pro Woche']);
  });
});

describe('Einsteiger (data/goals.json levels.beginner)', () => {
  const rules = planData.goals.levels.beginner;

  it.each(GOAL_IDS.flatMap((goal) => rules.days.map((days) => ({ goal, days }))))('$goal / $days Tage', ({ goal, days }) => {
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
    // weniger Uebungen je Einheit als Fortgeschrittene, dafuer einheitlich 3 Saetze
    beg.dayPlans.forEach((day, i) => expect(day.rows.length).toBeLessThanOrEqual(adv.dayPlans[i]?.rows.length ?? 0));
  });
});
