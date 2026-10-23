// Konsistenz-Pruefung der Uebungsbibliothek gegen Kategorien, Slot-Pools und Wochenvorlagen.
// Wird von Vitest und von scripts/verify-plan-data.mjs genutzt.
import type { Exercise, ExercisesData, GoalId, PlanData, SlotDef } from './types';

export interface ExerciseCheckResult {
  errors: string[];
  warnings: string[];
  summary: string[];
}

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;
/** Hersteller, Koerpermasse und Zeichen, die nicht in Namen und Tipps gehoeren. */
const FORBIDDEN = [/panatta/i, /precor/i, /technogym/i, /hammer strength/i, /life ?fitness/i, /\bpeach\b/i, /169/, /\bHebel \d/, /°/, /\p{Extended_Pictographic}/u];
const FLAGS = ['heavy', 'stretch', 'unilateral', 'assisted', 'timed'] as const;

/** Uebungen, die einen Slot fuellen koennen (Kategorie und, falls gesetzt, Fokus). */
export function exercisesForSlot(exercises: Exercise[], slot: Pick<SlotDef, 'cat' | 'focus'>): Exercise[] {
  return exercises.filter((e) => e.category === slot.cat && (!slot.focus || e.focus.includes(slot.focus)));
}

export function checkExercises(plan: PlanData, data: ExercisesData): ExerciseCheckResult {
  const { goals, templates } = plan;
  const errors: string[] = [];
  const warnings: string[] = [];
  const summary: string[] = [];
  const goalIds = Object.keys(goals.goals);

  if (data.schema !== 1) errors.push(`exercises.json: schema ${String(data.schema)} statt 1`);
  for (const e of data.equipment) if (!(e in data.increments)) errors.push(`exercises.json: Schrittweite fuer ${e} fehlt`);
  for (const e of Object.keys(data.increments)) if (!data.equipment.includes(e)) errors.push(`exercises.json: Schrittweite fuer unbekannte Ausstattung ${e}`);

  const seen = { id: new Set<string>(), de: new Set<string>(), en: new Set<string>() };
  for (const ex of data.exercises) {
    const at = `Uebung ${ex.id}`;
    if (!ID_PATTERN.test(ex.id)) errors.push(`${at}: ID nur a-z, 0-9, _`);
    if (seen.id.has(ex.id)) errors.push(`${at}: ID doppelt`);
    if (!ex.name?.de || !ex.name?.en) errors.push(`${at}: Name de/en fehlt`);
    if (seen.de.has(ex.name.de)) errors.push(`${at}: deutscher Name doppelt (${ex.name.de})`);
    if (seen.en.has(ex.name.en)) errors.push(`${at}: englischer Name doppelt (${ex.name.en})`);
    seen.id.add(ex.id);
    seen.de.add(ex.name.de);
    seen.en.add(ex.name.en);
    if (!goals.categories[ex.category]) errors.push(`${at}: Kategorie ${ex.category} fehlt in goals.json`);
    for (const s of ex.secondary) {
      if (!goals.categories[s]) errors.push(`${at}: Nebenkategorie ${s} fehlt in goals.json`);
      if (s === ex.category) errors.push(`${at}: Nebenkategorie = Hauptkategorie`);
    }
    if (ex.equipment.length === 0) errors.push(`${at}: keine Ausstattung`);
    for (const e of ex.equipment) if (!data.equipment.includes(e)) errors.push(`${at}: Ausstattung ${e} unbekannt`);
    if (!data.patterns.includes(ex.pattern)) errors.push(`${at}: Bewegungsmuster ${ex.pattern} unbekannt`);
    for (const g of ex.stars) if (!goalIds.includes(g)) errors.push(`${at}: Stern fuer unbekanntes Ziel ${g}`);
    for (const flag of FLAGS) if (typeof ex[flag] !== 'boolean') errors.push(`${at}: ${flag} fehlt`);
    const tip = ex.tip?.de ?? '';
    if (!/^Einstellung: [^\n]+\nAusführung: [^\n]+$/.test(tip)) errors.push(`${at}: Tipp nicht im Format "Einstellung: ...\\nAusführung: ..."`);
    if (tip.length > 420) warnings.push(`${at}: Tipp ${tip.length} Zeichen (lang)`);
    for (const bad of FORBIDDEN) {
      if (bad.test(tip) || bad.test(ex.name.de) || bad.test(ex.name.en)) errors.push(`${at}: enthaelt ${String(bad)}`);
    }
  }

  for (const [goalId, goal] of Object.entries(goals.goals)) {
    const starredFor = (list: Exercise[]) => list.filter((e) => e.stars.includes(goalId as GoalId));

    // Jeder Slot braucht Auswahl (>= 3) und mindestens einen Stern; der schwerste Bereich eine schwere Stern-Uebung
    const checked = new Set<string>();
    for (const slot of goal.slots) {
      const heavy = slot.range === goals.ranges[0];
      const key = `${slot.cat}|${slot.focus ?? ''}|${heavy}`;
      if (checked.has(key)) continue;
      checked.add(key);
      const pool = exercisesForSlot(data.exercises, slot);
      const starred = starredFor(pool).filter((e) => !heavy || e.heavy);
      const label = `${goalId} ${slot.cat}${slot.focus ? ' ' + slot.focus : ''}${heavy ? ` (${slot.range})` : ''}`;
      if (pool.length < 3) errors.push(`${label}: nur ${pool.length} Uebungen`);
      if (starred.length === 0) errors.push(`${label}: keine passende Stern-Uebung`);
    }

    // Mehrere Slots derselben Kategorie an einem Tag: genug verschiedene Stern-Uebungen
    const slotById = new Map(goal.slots.map((s) => [s.id, s]));
    for (const [days, tpl] of Object.entries(templates.goals[goalId as GoalId] ?? {})) {
      for (const day of tpl.days) {
        const perCat = new Map<string, number>();
        for (const ref of day.slots) {
          const slot = slotById.get(typeof ref === 'string' ? ref : ref.id);
          if (slot) perCat.set(slot.cat, (perCat.get(slot.cat) ?? 0) + 1);
        }
        for (const [cat, need] of perCat) {
          const have = starredFor(data.exercises.filter((e) => e.category === cat)).length;
          if (have < need) warnings.push(`${goalId} ${days} Tage ${day.name}: ${need}x ${cat}, nur ${have} Stern-Uebungen`);
        }
      }
    }

    const cats = [...new Set(goal.slots.map((s) => s.cat))];
    summary.push(`Sterne ${goalId}: ${cats.map((c) => `${c} ${starredFor(data.exercises.filter((e) => e.category === c)).length}`).join(' · ')}`);
  }

  summary.push(`Uebungen je Kategorie: ${Object.keys(goals.categories).map((c) => `${c} ${data.exercises.filter((e) => e.category === c).length}`).join(' · ')}`);
  return { errors, warnings, summary };
}
