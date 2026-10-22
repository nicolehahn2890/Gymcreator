// Prueft data/goals.json + data/templates.json (+ data/exercises.json) mit dem echten Generator aus src/core:
// alle Ziele x Stufen x 3/4/5 Tage erzeugen und gegen die Grenzen pruefen (Saetze je Einheit, anteilige Saetze
// je Muskel und Einheit, Frequenz Prio 3, Prio 0 ohne Saetze), Apfel 4/3 Tage gegen Nicoles Plantabellen
// (tests/fixtures/peach-p4.json / peach-p3.json) und die Uebungsbibliothek gegen Kategorien und Slots.
// Aufruf: node scripts/verify-plan-data.mjs  (im Repo-Root, Node >= 22.18 wegen TypeScript-Import).
// Liegt die Trainingsapp read-only daneben (../Trainingsapp/index.html oder PEACH_INDEX), wird zusaetzlich
// geprueft, dass die Fixtures noch P4/P3 entsprechen. Die Trainingsapp wird dabei NIE veraendert.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildPlan } from '../src/core/generator/buildPlan.ts';
import { totalSets, validatePlan, weeklySets } from '../src/core/generator/validate.ts';
import { checkExercises } from '../src/core/model/exerciseCheck.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const data = { goals: readJson('data/goals.json'), templates: readJson('data/templates.json') };
let fails = 0;
let warns = 0;
const fail = (m) => { fails++; console.log('  FAIL ' + m); };
const warn = (m) => { warns++; console.log('  WARN ' + m); };

for (const goal of Object.keys(data.goals.goals)) {
  const pool = data.goals.goals[goal].slots;
  const ids = pool.map((s) => s.id);
  if (new Set(ids).size !== ids.length) fail(`${goal}: doppelte Slot-IDs im Pool`);
  console.log(`\n=== ${goal} - Pool ${pool.length} Slots, ${pool.reduce((a, s) => a + s.sets, 0)} Saetze`);
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
      const perDay = plan.dayPlans.map((d) => d.rows.reduce((a, r) => a + r.sets, 0)).join('/');
      console.log(`-- ${level} ${days} Tage: ${totalSets(plan)} Saetze (${perDay})` + (plan.paused.length ? ` pausiert: ${plan.paused.join(', ')}` : ''));
      if (level === 'advanced') {
        for (const d of plan.dayPlans) console.log(`   ${d.letter} ${d.name}: ${d.rows.map((r) => `${r.category} ${r.sets}x${r.repRange}`).join(' · ')}`);
        console.log('   Woche: ' + Object.entries(weeklySets(plan)).map(([c, v]) => `${c} ${v}`).join(' · '));
      }
    }
  }
}

// Regression: Apfel, Fortgeschritten = Nicoles Plantabellen
const table = (plan) => plan.dayPlans.map((d) => ({ name: d.name, focus: d.focus, rows: d.rows.map((r) => ({ category: r.category, sets: r.sets, range: r.repRange })) }));
const fixtures = { 4: readJson('tests/fixtures/peach-p4.json').days, 3: readJson('tests/fixtures/peach-p3.json').days };
for (const days of [4, 3]) {
  const got = JSON.stringify(table(buildPlan(data, { goal: 'apfel', level: 'advanced', days })));
  console.log(`\n=== Regression Apfel ${days} Tage gegen tests/fixtures (Nicoles Plan)`);
  if (got !== JSON.stringify(fixtures[days])) fail(`Apfel ${days} Tage weicht von der Plantabelle ab`);
  else console.log('  identisch (Tagesnamen, Fokus, Kategorie, Saetze, Bereich, Reihenfolge)');
}

const PEACH = process.env.PEACH_INDEX || path.join(ROOT, '..', 'Trainingsapp', 'index.html');
if (fs.existsSync(PEACH)) {
  // nur lesen
  const src = fs.readFileSync(PEACH, 'utf8');
  const grab = (name) => { const i = src.indexOf('const ' + name + '=['); const j = src.indexOf('\n];', i); return src.slice(i + ('const ' + name + '=').length, j + 2); };
  const ctx = {};
  vm.createContext(ctx);
  const byLabel = Object.fromEntries(Object.entries(data.goals.categories).map(([id, c]) => [c.label.de, id]));
  for (const [name, days] of [['P4', 4], ['P3', 3]]) {
    const ref = vm.runInContext('(' + grab(name) + ')', ctx).map((d) => ({ name: d.l, focus: d.f, rows: d.e.map((e) => ({ category: byLabel[e.c], sets: e.s, range: `${e.r[0]}-${e.r[1]}` })) }));
    if (JSON.stringify(ref) !== JSON.stringify(fixtures[days])) fail(`tests/fixtures/peach-${name.toLowerCase()}.json entspricht nicht mehr ${name} in der Trainingsapp`);
    else console.log(`  Fixture ${name} = Trainingsapp ${name}`);
  }
} else {
  console.log(`  (Abgleich Fixture <-> Trainingsapp uebersprungen: ${PEACH} nicht vorhanden)`);
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
