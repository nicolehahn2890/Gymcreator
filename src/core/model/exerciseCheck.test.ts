import { describe, expect, it } from 'vitest';
import { exerciseData, planData } from './data';
import { checkExercises, exercisesForSlot } from './exerciseCheck';
import type { Exercise, ExercisesData } from './types';

function withExercises(exercises: Exercise[]): ExercisesData {
  return { ...exerciseData, exercises };
}

describe('Uebungsbibliothek', () => {
  it('ist konsistent mit Kategorien, Slots und Vorlagen', () => {
    const result = checkExercises(planData, exerciseData);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('hat 150 bis 180 Uebungen', () => {
    expect(exerciseData.exercises.length).toBeGreaterThanOrEqual(150);
    expect(exerciseData.exercises.length).toBeLessThanOrEqual(180);
  });

  it('assistierte Uebungen sind die Klimmzuege mit Gegengewicht', () => {
    expect(exerciseData.exercises.filter((e) => e.assisted).map((e) => e.id).sort()).toEqual(['assisted_pull_up_close', 'assisted_pull_up_wide']);
  });

  it('findet Uebungen fuer einen Slot ueber Kategorie und Fokus', () => {
    const vertical = exercisesForSlot(exerciseData.exercises, { cat: 'back', focus: 'vertical' });
    expect(vertical.map((e) => e.id)).toContain('lat_pulldown_wide');
    expect(vertical.map((e) => e.id)).not.toContain('barbell_row');
  });

  it('meldet Herstellernamen, falsches Tipp-Format und doppelte IDs', () => {
    const base = exerciseData.exercises[0];
    if (!base) throw new Error('leer');
    const broken: Exercise[] = [
      ...exerciseData.exercises,
      { ...base, name: { de: 'Beinpresse (Precor)', en: 'Leg press X' } },
      { ...base, id: 'neu_ohne_format', name: { de: 'Neu', en: 'New' }, tip: { de: 'Einfach machen.' } },
    ];
    const { errors } = checkExercises(planData, withExercises(broken));
    expect(errors.some((e) => e.includes('ID doppelt'))).toBe(true);
    expect(errors.some((e) => e.includes('precor'))).toBe(true);
    expect(errors.some((e) => e.includes('Tipp nicht im Format'))).toBe(true);
  });

  it('meldet Slots ohne Stern-Uebung', () => {
    const noStars = exerciseData.exercises.map((e) => (e.category === 'gmed' ? { ...e, stars: [] } : e));
    const { errors } = checkExercises(planData, withExercises(noStars));
    expect(errors).toContain('apfel gmed: keine passende Stern-Uebung');
  });
});
