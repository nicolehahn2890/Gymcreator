import { describe, expect, it } from 'vitest';
import peachP3 from '../../../tests/fixtures/peach-p3.json';
import peachP4 from '../../../tests/fixtures/peach-p4.json';
import { planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS, LEVELS, type Plan } from '../model/types';
import { buildPlan } from './buildPlan';
import { totalSets, validatePlan, weeklySets } from './validate';

const combos = GOAL_IDS.flatMap((goal) => LEVELS.flatMap((level) => DAY_COUNTS.map((days) => ({ goal, level, days }))));

function asTable(plan: Plan) {
  return plan.dayPlans.map((d) => ({
    name: d.name,
    focus: d.focus,
    rows: d.rows.map((r) => ({ category: r.category, sets: r.sets, range: r.repRange })),
  }));
}

describe('buildPlan', () => {
  it.each(combos)('$goal / $level / $days Tage: keine Fehler', (req) => {
    const plan = buildPlan(planData, req);
    expect(plan.dayPlans).toHaveLength(req.days);
    expect(validatePlan(planData, plan).filter((i) => i.level === 'error')).toEqual([]);
  });

  it('ist deterministisch', () => {
    for (const req of combos) expect(buildPlan(planData, req)).toEqual(buildPlan(planData, req));
  });

  it('Apfel, Fortgeschritten, 4 Tage = Nicoles 4-Tage-Plan (P4)', () => {
    expect(asTable(buildPlan(planData, { goal: 'apfel', level: 'advanced', days: 4 }))).toEqual(peachP4.days);
  });

  it('Apfel, Fortgeschritten, 3 Tage = Nicoles 3-Tage-Plan (P3)', () => {
    expect(asTable(buildPlan(planData, { goal: 'apfel', level: 'advanced', days: 3 }))).toEqual(peachP3.days);
  });

  it('Wochensaetze Fortgeschritten wie in docs/konzept.md 3.2', () => {
    const expected = { apfel: [62, 70, 72], sanduhr: [62, 71, 73], vform: [61, 72, 77] };
    for (const goal of GOAL_IDS) {
      const got = DAY_COUNTS.map((days) => totalSets(buildPlan(planData, { goal, level: 'advanced', days })));
      expect(got, goal).toEqual(expected[goal]);
    }
  });

  it('Kategorie-Tabelle 4 Tage wie in docs/konzept.md 3.2', () => {
    const plan = buildPlan(planData, { goal: 'vform', level: 'advanced', days: 4 });
    expect(weeklySets(plan)).toMatchObject({ back: 14, shoulders: 13, chest: 10, biceps: 5, triceps: 5, calves: 4, abs: 6 });
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
    expect(plan.paused).toEqual(['back_8-12_c', 'chest_8-12_b', 'gquad_8-12_a', 'gmax_8-12_a', 'calves_8-12_a', 'calves_12-15_a', 'abs_8-12_c']);
    const used = plan.dayPlans.flatMap((d) => d.rows.map((r) => r.slotId));
    expect(new Set([...used, ...plan.paused]).size).toBe(planData.goals.goals.vform.slots.length);
  });

  it('Tage tragen Buchstaben A-E', () => {
    expect(buildPlan(planData, { goal: 'sanduhr', level: 'advanced', days: 5 }).dayPlans.map((d) => d.letter)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
});

describe('Einsteiger-Regeln (data/goals.json levels.beginner)', () => {
  const rules = planData.goals.levels.beginner;

  it.each(GOAL_IDS.flatMap((goal) => DAY_COUNTS.map((days) => ({ goal, days }))))('$goal / $days Tage', ({ goal, days }) => {
    const adv = buildPlan(planData, { goal, level: 'advanced', days });
    const beg = buildPlan(planData, { goal, level: 'beginner', days });
    const begRows = beg.dayPlans.flatMap((d) => d.rows);

    // feste Satzzahl und ersetzte Bereiche
    for (const row of begRows) {
      expect(row.sets).toBe(rules.setsPerSlot);
      expect(Object.keys(rules.rangeMap ?? {})).not.toContain(row.repRange);
    }

    // Kategorien mit vielen Slots verlieren genau einen: den letzten im Pool unter den Slots,
    // deren Kategorie am selben Tag noch einmal vorkommt (Haeufigkeit pro Woche bleibt gleich)
    const pool = planData.goals.goals[goal].slots.map((s) => s.id);
    const advIds = adv.dayPlans.flatMap((d) => d.rows.map((r) => r.slotId));
    const begIds = new Set(begRows.map((r) => r.slotId));
    const byCat = new Map<string, { id: string; day: number }[]>();
    for (const day of adv.dayPlans) {
      for (const r of day.rows) byCat.set(r.category, [...(byCat.get(r.category) ?? []), { id: r.slotId, day: day.index }]);
    }
    for (const [cat, slots] of byCat) {
      const missing = slots.filter((s) => !begIds.has(s.id)).map((s) => s.id);
      const doubled = slots.filter((s) => slots.some((o) => o !== s && o.day === s.day)).map((s) => s.id);
      if (slots.length >= (rules.dropLastSlotFromCategoriesWith ?? Infinity) && doubled.length) {
        const last = doubled.sort((a, b) => pool.indexOf(a) - pool.indexOf(b)).at(-1);
        expect(missing, cat).toEqual([last]);
      } else {
        expect(missing, cat).toEqual([]);
      }
      const daysBefore = new Set(slots.map((s) => s.day)).size;
      const daysAfter = new Set(slots.filter((s) => begIds.has(s.id)).map((s) => s.day)).size;
      expect(daysAfter, cat).toBe(daysBefore);
    }

    // Slot-IDs bleiben stabil, nur der Bereich ist ein Feld
    for (const id of begIds) expect(advIds).toContain(id);
    expect(totalSets(beg)).toBeLessThan(totalSets(adv));
  });
});
