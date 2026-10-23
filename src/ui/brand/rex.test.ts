import { describe, expect, it } from 'vitest';
import { dayDoneRex } from './rex';

describe('dayDoneRex', () => {
  it('beginnt mit Puh', () => {
    expect(dayDoneRex(1, 1, 0)).toContain('rex-puh');
  });

  it('wechselt von Tag zu Tag', () => {
    for (let day = 0; day < 4; day += 1) expect(dayDoneRex(1, 3, day)).not.toBe(dayDoneRex(1, 3, day + 1));
  });

  it('wechselt fuer denselben Tag von Woche zu Woche', () => {
    expect(dayDoneRex(1, 2, 0)).not.toBe(dayDoneRex(1, 3, 0));
  });

  it('bleibt fuer denselben Tag gleich', () => {
    expect(dayDoneRex(2, 5, 1)).toBe(dayDoneRex(2, 5, 1));
  });

  it('nutzt alle vier Reaktionen', () => {
    expect(new Set([0, 1, 2, 3].map((day) => dayDoneRex(1, 1, day))).size).toBe(4);
  });
});
