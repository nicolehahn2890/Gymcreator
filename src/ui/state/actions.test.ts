import { describe, expect, it } from 'vitest';
import type { Entry } from '../../core/model/types';
import { withSetValue } from './actions';

const base: Entry = {
  cycle: 1,
  week: 1,
  slotId: 'gmax_6-8_a',
  day: 0,
  exerciseId: 'hip_thrust_barbell',
  sets: [],
  extraSets: 0,
  category: 'gmax',
  repRange: '6-8',
  baseSets: 3,
};

describe('withSetValue', () => {
  it('uebernimmt ein Gewicht in die folgenden leeren Saetze', () => {
    const e = withSetValue(base, 3, 0, { w: '100' });
    expect(e.sets).toEqual([
      { w: '100', r: null },
      { w: '100', r: null },
      { w: '100', r: null },
    ]);
  });

  it('ueberschreibt keine schon eingetragenen Gewichte', () => {
    const e1 = withSetValue(base, 3, 2, { w: '90' });
    const e2 = withSetValue(e1, 3, 0, { w: '100' });
    expect(e2.sets.map((s) => s.w)).toEqual(['100', '100', '90']);
  });

  it('setzt Wiederholungen nur im gewaehlten Satz', () => {
    const e = withSetValue(withSetValue(base, 3, 0, { w: '100' }), 3, 1, { r: 8 });
    expect(e.sets.map((s) => s.r)).toEqual([null, 8, null]);
  });

  it('speichert keine leeren Saetze am Ende', () => {
    const e = withSetValue(base, 3, 0, { r: 8 });
    expect(e.sets).toEqual([{ w: '', r: 8 }]);
    expect(withSetValue(e, 3, 0, { r: null }).sets).toEqual([]);
  });
});
