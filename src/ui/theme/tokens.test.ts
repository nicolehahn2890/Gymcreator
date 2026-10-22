import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { planData } from '../../core/model/data';
import { GOAL_IDS } from '../../core/model/types';

const css = fs.readFileSync(path.join(import.meta.dirname, 'tokens.css'), 'utf8');

function token(name: string): string | undefined {
  return css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
}

describe('tokens.css', () => {
  it('Kategorie-Farben stimmen mit data/goals.json ueberein', () => {
    for (const [id, cat] of Object.entries(planData.goals.categories)) {
      expect(token(`cat-${id}`)?.toUpperCase(), id).toBe(cat.color.toUpperCase());
    }
  });

  it('jedes Ziel hat einen Akzent, der auf ein vorhandenes Farb-Token zeigt', () => {
    for (const id of GOAL_IDS) {
      const accent = planData.goals.goals[id].accent;
      expect(token(accent), accent).toBeDefined();
      expect(css).toContain(`html[data-goal="${id}"] { --accent: var(--${accent}); }`);
    }
  });

  it('Basis ist Cream', () => {
    expect(token('cream')).toBe('#FBF3E7');
    expect(token('bg')).toBe('var(--cream)');
  });

  it('Ziele in GOAL_IDS und data/goals.json sind dieselben', () => {
    expect(Object.keys(planData.goals.goals).sort()).toEqual([...GOAL_IDS].sort());
  });
});
