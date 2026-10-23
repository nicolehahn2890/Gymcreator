// Prueft data/goals.json + data/templates.json (+ data/exercises.json) mit dem echten Generator aus src/core:
// alle Ziele x Stufen x 3/4/5 Tage erzeugen und gegen die Grenzen pruefen (Uebungen und Saetze je Einheit,
// Zeilen je Kategorie und Tag, anteilige Saetze je Muskel und Einheit, Wochenziele je Muskel, Frequenz Prio 3,
// Prio 0 nicht im Plan) und die Uebungsbibliothek gegen Kategorien und Slots.
// Aufruf: node scripts/verify-plan-data.mjs  (im Repo-Root, Node >= 22.18 wegen TypeScript-Import).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPlan } from '../src/core/generator/buildPlan.ts';
import { totalSets, validatePlan, weeklyMuscles } from '../src/core/generator/validate.ts';
import { checkExercises } from '../src/core/model/exerciseCheck.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const data = { goals: readJson('data/goals.json'), templates: readJson('data/templates.json') };
let fails = 0;
let warns = 0;
const fail = (m) => { fails++; console.log('  FAIL ' + m); };
const warn = (m) => { warns++; console.log('  WARN ' + m); };

for (const goal of Object.keys(data.goals.goals)) {
  const goalDef = data.goals.goals[goal];
  const ids = goalDef.slots.map((s) => s.id);
  if (new Set(ids).size !== ids.length) fail(`${goal}: doppelte Slot-IDs im Pool`);
  for (const s of goalDef.slots) if (s.id !== `${s.cat}_${s.range}_${s.id.at(-1)}`) fail(`${goal}: Slot-ID ${s.id} passt nicht zu ${s.cat}/${s.range}`);
  console.log(`\n=== ${goal} - Pool ${goalDef.slots.length} Slots, Hauptmuskelgruppe ${goalDef.mainCategory}`);
  for (const level of Object.keys(data.goals.levels)) {
    for (const days of [3, 4, 5]) {
      let plan;
      try {
        plan = buildPlan(data, { goal, level, days });
      } catch (e) {
        fail(e.message);
        continue;
      }
      for (const issue of validatePlan(data, plan)) (issue.level === 'error' ? fail : warn)(issue.message);
      const perDay = plan.dayPlans.map((d) => `${d.rows.length}/${d.rows.reduce((a, r) => a + r.sets, 0)}`).join(' ');
      console.log(`-- ${level} ${days} Tage: ${totalSets(plan)} Saetze (Uebungen/Saetze je Tag: ${perDay})`);
      if (level === 'advanced') {
        for (const d of plan.dayPlans) console.log(`   ${d.letter} ${d.name}: ${d.rows.map((r) => `${r.category} ${r.sets}x${r.repRange}`).join(' · ')}`);
      }
      const targets = goalDef.targets[level];
      const weekly = weeklyMuscles(data, plan);
      console.log('   Woche je Muskel: ' + Object.entries(targets).map(([m, [lo, hi]]) => `${m} ${weekly[m] ?? 0} (${lo}-${hi})`).join(' · '));
    }
  }
}

// Uebungsbibliothek
const exPath = path.join(ROOT, 'data/exercises.json');
if (fs.existsSync(exPath)) {
  const exercises = JSON.parse(fs.readFileSync(exPath, 'utf8'));
  console.log(`\n=== Uebungsbibliothek: ${exercises.exercises.length} Uebungen`);
  const result = checkExercises(data, exercises);
  result.errors.forEach(fail);
  result.warnings.forEach(warn);
  result.summary.forEach((l) => console.log('  ' + l));
} else {
  fail('data/exercises.json fehlt');
}

console.log(fails ? `\n${fails} FEHLER, ${warns} Warnungen` : `\nALLE PRUEFUNGEN GRUEN (${warns} Warnungen)`);
process.exit(fails ? 1 : 0);
