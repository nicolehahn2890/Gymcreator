import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Profile, Week } from '../../core/model/types';
import { applyExercise } from '../../core/progression/inherit';
import { rowState } from '../../core/progression/state';
import { addShortSet, entryForEdit, saveEntry, saveProfile, saveWeekDays, setShort, withExtraSets, withSetValue, type Position } from './actions';
import { daysFor, planFor, rowContext, type AppModel } from './model';
import { store } from './store';

// Ablaeufe aus der Oberflaeche mit dem echten Speicher-Zustand (wie die Bildschirme die Aktionen aufrufen)

const profile: Profile = { goal: 'apfel', days: 4, equipment: ['barbell', 'dumbbell', 'machine', 'bodyweight'], increments: {}, lang: 'de', createdAt: '2026-10-23' };
const at = (week: number): Position => ({ cycle: 1, week });
const model = (): AppModel => {
  const m = store.getState().model;
  if (!m) throw new Error('kein Profil');
  return m;
};
const reset = (weeks: Week[] = []) => store.replaceAll({ profile, entries: [], weeks, notes: [], custom: [] });

function rowAt(pos: Position, slotId: string) {
  const plan = planFor(model(), pos.cycle, pos.week);
  const day = plan.dayPlans.findIndex((d) => d.rows.some((r) => r.slotId === slotId));
  const row = plan.dayPlans[day]?.rows.find((r) => r.slotId === slotId);
  if (!row) throw new Error(`${slotId} fehlt`);
  return { plan, day, row, st: rowState(rowContext(model(), pos.cycle, pos.week), row, pos) };
}

/** Wie ExerciseItem: Uebung waehlen und Wiederholungen eintragen. */
function log(pos: Position, slotId: string, exerciseId: string, reps: number[]) {
  const { plan, day, row, st } = rowAt(pos, slotId);
  let entry = applyExercise(entryForEdit(model(), row, pos, day, st), exerciseId, false, st.inheritedExerciseId);
  reps.forEach((r, i) => (entry = withSetValue(entry, st.totalSets, i, { w: '50', r })));
  saveEntry(model(), plan, entry);
}

const dayA = () => {
  const day = planFor(model(), 1, 1).dayPlans[0];
  if (!day) throw new Error('Tag A fehlt');
  return day;
};

beforeEach(() => reset());

describe('Ziel und Trainingstage', () => {
  it('neues Ziel hebt den Kurz-Modus auf: kein Tag des neuen Plans ist gekuerzt', () => {
    setShort(model(), at(1), dayA(), 45);
    expect(model().data.weeks[0]?.short).toBeDefined();
    saveProfile(model(), at(1), { ...profile, goal: 'sanduhr' }, false);
    expect(model().data.weeks).toEqual([{ cycle: 1, week: 1, days: 4 }]);
    const ctx = rowContext(model(), 1, 1);
    for (const day of planFor(model(), 1, 1).dayPlans) for (const row of day.rows) expect(rowState(ctx, row, at(1)).skipped, row.slotId).toBe(false);
  });

  it('Wochenart im Plan: Kurz-Modus bleibt fuer gleiche Tage, die Wahl wird ab der aktuellen Woche Standard', () => {
    setShort(model(), at(1), dayA(), 45);
    const short = model().data.weeks[0]?.short;
    // Apfel Tag A ist mit 4 und 5 Tagen gleich, mit 3 Tagen nicht
    saveWeekDays(model(), at(1), 5);
    expect(model().data.weeks).toEqual([{ cycle: 1, week: 1, days: 5, short }]);
    expect(model().profile.days).toBe(5);
    saveWeekDays(model(), at(1), 3);
    expect(model().data.weeks).toEqual([{ cycle: 1, week: 1, days: 3 }]);
    expect(model().profile.days).toBe(3);
  });

  it('Wochenart einer frueheren Woche aendert den Standard nicht', () => {
    log(at(1), 'gmax_6-8_a', 'hip_thrust_barbell', [8, 8, 8]);
    log(at(2), 'gmax_6-8_a', 'hip_thrust_barbell', [8, 8, 8]);
    saveWeekDays(model(), at(1), 3);
    expect(model().profile.days).toBe(4);
    expect([1, 2, 3].map((w) => daysFor(model(), 1, w))).toEqual([3, 4, 4]);
  });

  it('Einstellungen bei angezeigter frueherer Woche: gilt ab der juengsten Woche, mit Werten in wegfallenden Uebungen ab der folgenden', () => {
    // Brust gibt es bei Apfel nur im 4- und 5-Tage-Plan
    for (const w of [1, 2, 3]) log(at(w), 'chest_8-12_a', 'bench_press_dumbbell', [10]);
    expect(saveProfile(model(), at(1), { ...profile, days: 3 }, true)).toEqual(at(4));
    expect([1, 2, 3, 4, 5].map((w) => daysFor(model(), 1, w))).toEqual([4, 4, 4, 3, 3]);
    expect(model().profile.days).toBe(3);
  });

  it('Einstellungen: der bisherige Standard stellt eine abweichende Woche zurueck, andere Aenderungen lassen sie', async () => {
    await reset([{ cycle: 1, week: 1, days: 3 }]);
    saveProfile(model(), at(1), { ...profile, equipment: ['bodyweight'] }, false);
    expect(daysFor(model(), 1, 1)).toBe(3);
    expect(saveProfile(model(), at(1), { ...profile, days: 4 }, true)).toBeNull();
    expect(daysFor(model(), 1, 1)).toBe(4);
  });
});

describe('Kurz-Modus', () => {
  it('ein von Hand hinzugefuegter Satz zaehlt mit', () => {
    setShort(model(), at(1), dayA(), 45);
    const { plan, day, row, st } = rowAt(at(1), 'gmax_6-8_a');
    expect(st).toMatchObject({ totalSets: 3, targetSets: 3 });
    // wie ExerciseItem.changeSets(+1)
    saveEntry(model(), plan, withExtraSets(entryForEdit(model(), row, at(1), day, st), 1, 4));
    addShortSet(model(), at(1), 'gmax_6-8_a');
    expect(rowAt(at(1), 'gmax_6-8_a').st).toMatchObject({ totalSets: 4, targetSets: 4 });
    // ausgelassene Uebung bleibt ausgelassen
    const skipped = dayA().rows.find((r) => rowAt(at(1), r.slotId).st.skipped);
    if (!skipped) throw new Error('keine ausgelassene Uebung');
    addShortSet(model(), at(1), skipped.slotId);
    expect(rowAt(at(1), skipped.slotId).st.skipped).toBe(true);
  });
});
