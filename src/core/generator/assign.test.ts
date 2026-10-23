import { describe, expect, it } from 'vitest';
import { exerciseData, planData } from '../model/data';
import { DAY_COUNTS, GOAL_IDS, LEVELS, type GoalId, type Level } from '../model/types';
import { assignDefaults, type AssignOptions } from './assign';
import { buildPlan, poolRows } from './buildPlan';

const all = exerciseData.equipment;
const heavyRange = planData.goals.ranges[0] ?? '';
const byId = new Map(exerciseData.exercises.map((e) => [e.id, e]));
const opts = (goal: GoalId, level: Level, equipment: readonly string[] = all): AssignOptions => ({ goal, level, equipment, heavyRange });
const assign = (goal: GoalId, level: Level, equipment: readonly string[] = all) =>
  assignDefaults(poolRows(planData, goal, level), exerciseData.exercises, opts(goal, level, equipment));

describe('Standard-Uebung je Slot', () => {
  it.each(GOAL_IDS.flatMap((goal) => LEVELS.map((level) => ({ goal, level }))))('$goal / $level: jeder Slot passend belegt', ({ goal, level }) => {
    const result = assign(goal, level);
    for (const row of poolRows(planData, goal, level)) {
      const ex = byId.get(result[row.slotId] ?? '');
      expect(ex, row.slotId).toBeDefined();
      expect(ex?.category, row.slotId).toBe(row.category);
      if (row.focus) expect(ex?.focus, row.slotId).toContain(row.focus);
      if (row.repRange === heavyRange) expect(ex?.heavy, row.slotId).toBe(true);
    }
  });

  it('keine Uebung doppelt am selben Tag (alle Ziele, Stufen, Wochenarten)', () => {
    for (const goal of GOAL_IDS) {
      for (const level of LEVELS) {
        const result = assign(goal, level);
        for (const days of DAY_COUNTS) {
          for (const day of buildPlan(planData, { goal, level, days }).dayPlans) {
            const ids = day.rows.map((r) => result[r.slotId]);
            expect(new Set(ids).size, `${goal}/${level}/${days} ${day.name}`).toBe(ids.length);
          }
        }
      }
    }
  });

  it('erste Zeile jeder Kategorie bekommt eine Stern-Uebung des Ziels', () => {
    for (const goal of GOAL_IDS) {
      const result = assign(goal, 'advanced');
      const seen = new Set<string>();
      for (const row of poolRows(planData, goal, 'advanced')) {
        if (seen.has(row.category)) continue;
        seen.add(row.category);
        expect(byId.get(result[row.slotId] ?? '')?.stars, `${goal} ${row.slotId}`).toContain(goal);
      }
    }
  });

  it('Apfel 4-8: Hip Thrust mit der Langhantel zuerst', () => {
    expect(assign('apfel', 'advanced')['gmax_4-8_a']).toBe('hip_thrust_barbell');
  });

  it('Einsteiger bekommen gefuehrte Uebungen (Maschine, Kabel), wo es passende Stern-Uebungen gibt', () => {
    const apfel = assign('apfel', 'beginner');
    expect(apfel['gmax_4-8_a']).toBe('hip_thrust_machine');
    const vform = assign('vform', 'beginner');
    expect(vform['back_8-12_a']).not.toBe('pull_up');
    expect(vform['back_4-8_a']).toBe('row_machine');
    for (const id of [vform['back_6-10_a'], vform['back_8-12_a'], vform['back_4-8_a']]) {
      const eq = byId.get(id ?? '')?.equipment ?? [];
      expect(eq.includes('machine') || eq.includes('cable'), id).toBe(true);
    }
  });

  it('nur Kurzhanteln, Bank und Baender: alles mit vorhandener Ausstattung', () => {
    const equipment = ['dumbbell', 'bodyweight', 'band'];
    for (const goal of GOAL_IDS) {
      const result = assign(goal, 'advanced', equipment);
      for (const id of Object.values(result)) expect(byId.get(id)?.equipment.every((q) => equipment.includes(q)), id).toBe(true);
    }
    const apfel = assign('apfel', 'advanced', equipment);
    expect(Object.keys(apfel)).toHaveLength(planData.goals.goals.apfel.slots.length);
  });

  it('ist deterministisch und unabhaengig von der Wochenart', () => {
    expect(assign('sanduhr', 'advanced')).toEqual(assign('sanduhr', 'advanced'));
  });
});
