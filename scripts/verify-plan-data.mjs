// Prueft data/goals.json + data/templates.json: Slot-IDs, Saetze je Tag, anteilige Saetze je Muskel und Einheit,
// Wochenvolumen je Kategorie, Frequenz der Prio-3-Kategorien, Reihenfolge-Regel, und Peach 4/3 Tage gegen P4/P3.
import fs from 'node:fs';
import vm from 'node:vm';
// Aufruf: node scripts/verify-plan-data.mjs  (im Repo-Root). Peach-Regression nur, wenn die Trainingsapp
// read-only daneben liegt (../Trainingsapp/index.html) oder PEACH_INDEX gesetzt ist — sie wird NIE veraendert.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/goals.json'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/templates.json'), 'utf8'));
const rangeRank = r => G.ranges.indexOf(r);
let fails = 0, warns = 0;
const fail = m => { fails++; console.log('  FAIL ' + m); };
const warn = m => { warns++; console.log('  WARN ' + m); };
function buildDays(goal, days) {
  const g = G.goals[goal], tpl = T.goals[goal][String(days)];
  const byId = Object.fromEntries(g.slots.map(s => [s.id, s]));
  const seen = new Set();
  return tpl.days.map(d => {
    const rows = d.slots.map(e => {
      const id = typeof e === 'string' ? e : e.id, sets = typeof e === 'string' ? undefined : e.sets;
      const s = byId[id];
      if (!s) fail(`${goal}/${days}: unbekannter Slot ${id}`);
      if (seen.has(id)) fail(`${goal}/${days}: Slot ${id} doppelt in der Woche`);
      seen.add(id);
      return { ...s, sets: sets ?? s.sets, tplOrder: 0 };
    }).map((r, i) => ({ ...r, tplOrder: i }));
    const order = g.categoryOrder;
    rows.sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat) || rangeRank(a.range) - rangeRank(b.range) || a.tplOrder - b.tplOrder);
    return { name: d.name, focus: d.focus, rows };
  });
}
for (const goal of Object.keys(G.goals)) {
  const g = G.goals[goal];
  const ids = g.slots.map(s => s.id);
  if (new Set(ids).size !== ids.length) fail(`${goal}: doppelte Slot-IDs im Pool`);
  for (const s of g.slots) { if (!G.categories[s.cat]) fail(`${goal}: Kategorie ${s.cat} fehlt`); if (!G.ranges.includes(s.range)) fail(`${goal}: Bereich ${s.range}`); }
  const poolTotal = g.slots.reduce((a, s) => a + s.sets, 0);
  console.log(`\n=== ${goal} — Pool ${g.slots.length} Slots, ${poolTotal} Saetze`);
  for (const days of [3, 4, 5]) {
    const plan = buildDays(goal, days);
    const used = new Set();
    const weekly = {}, freq = {};
    let total = 0;
    const lines = [];
    for (const d of plan) {
      const sets = d.rows.reduce((a, r) => a + r.sets, 0); total += sets;
      const frac = {};
      for (const r of d.rows) {
        used.add(r.id);
        weekly[r.cat] = (weekly[r.cat] || 0) + r.sets;
        (freq[r.cat] = freq[r.cat] || new Set()).add(d.name);
        for (const [m, w] of Object.entries(G.categories[r.cat].muscles)) frac[m] = (frac[m] || 0) + r.sets * w;
      }
      if (sets > G.limits.maxSetsPerSession) fail(`${goal}/${days} ${d.name}: ${sets} Saetze > ${G.limits.maxSetsPerSession}`);
      else if (sets > G.limits.warnSetsPerSession) warn(`${goal}/${days} ${d.name}: ${sets} Saetze > ${G.limits.warnSetsPerSession} (lange Einheit)`);
      for (const [m, v] of Object.entries(frac)) if (v > G.limits.maxFractionalSetsPerMusclePerSession) fail(`${goal}/${days} ${d.name}: ${m} ${v} anteilige Saetze > ${G.limits.maxFractionalSetsPerMusclePerSession}`);
      const top = Object.entries(frac).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m, v]) => `${m} ${v}`).join(', ');
      lines.push(`  ${d.name}: ${d.rows.length} Uebungen, ${sets} Saetze (${top})`);
      // Bauch zuletzt, wenn vorhanden
      const absIdx = d.rows.findIndex(r => r.cat === 'abs');
      if (absIdx >= 0 && absIdx !== d.rows.length - 1 && d.rows.slice(absIdx).some(r => r.cat !== 'abs')) fail(`${goal}/${days} ${d.name}: Bauch nicht zuletzt`);
    }
    for (const [cat, p] of Object.entries(g.priorities)) {
      if (p === 3 && (!freq[cat] || freq[cat].size < G.limits.minFrequencyPrio3)) fail(`${goal}/${days}: Prio-3-Kategorie ${cat} nur ${freq[cat] ? freq[cat].size : 0}x pro Woche`);
      if (p === 0 && weekly[cat]) fail(`${goal}/${days}: Prio-0-Kategorie ${cat} hat ${weekly[cat]} Saetze`);
    }
    const unused = g.slots.filter(s => !used.has(s.id)).map(s => s.id);
    console.log(`-- ${days} Tage: ${total} Saetze/Woche` + (unused.length ? ` (pausiert: ${unused.join(', ')})` : ''));
    lines.forEach(l => console.log(l));
    console.log('  Woche je Kategorie: ' + Object.entries(weekly).map(([c, v]) => `${c} ${v}`).join(' · '));
  }
}
// Peach-Regression gegen P4/P3 aus der Trainingsapp (nur gelesen)
const PEACH = process.env.PEACH_INDEX || path.join(ROOT, '..', 'Trainingsapp', 'index.html');
if (!fs.existsSync(PEACH)) {
  console.log(`\n(Peach-Regression uebersprungen: ${PEACH} nicht vorhanden — Trainingsapp-Repo read-only neben das Gymcreator-Repo legen)`);
  console.log(fails ? `\n${fails} FEHLER, ${warns} Warnungen` : `\nALLE PRUEFUNGEN GRUEN (${warns} Warnungen: lange Einheiten)`);
  process.exit(fails ? 1 : 0);
}
const src = fs.readFileSync(PEACH, 'utf8');
const grab = name => { const i = src.indexOf('const ' + name + '=['); const j = src.indexOf('\n];', i); return src.slice(i + ('const ' + name + '=').length, j + 2); };
const ctx = {}; vm.createContext(ctx);
const P4 = vm.runInContext('(' + grab('P4') + ')', ctx), P3 = vm.runInContext('(' + grab('P3') + ')', ctx);
const label = cat => G.categories[cat].label.de;
function compare(days, ref, tag) {
  const before = fails;
  const plan = buildDays('apfel', days);
  console.log(`\n=== Regression Apfel (= Peach-Plan) ${days} Tage gegen ${tag}`);
  if (plan.length !== ref.length) fail(`${tag}: ${plan.length} Tage statt ${ref.length}`);
  ref.forEach((rd, di) => {
    const pd = plan[di]; if (!pd) return;
    if (pd.name !== rd.l) fail(`${tag} Tag ${di}: Name "${pd.name}" statt "${rd.l}"`);
    if (pd.focus !== rd.f) fail(`${tag} Tag ${di}: Fokus "${pd.focus}" statt "${rd.f}"`);
    if (pd.rows.length !== rd.e.length) fail(`${tag} ${rd.l}: ${pd.rows.length} Zeilen statt ${rd.e.length}`);
    rd.e.forEach((re, ei) => {
      const pr = pd.rows[ei]; if (!pr) return;
      const want = `${re.c} ${re.s}x${re.r[0]}-${re.r[1]}`, got = `${label(pr.cat)} ${pr.sets}x${pr.range}`;
      if (want !== got) fail(`${tag} ${rd.l} Zeile ${ei + 1}: ${got} statt ${want}`);
    });
  });
  console.log('  ' + (fails > before ? 'ABWEICHUNG, siehe FAIL' : 'identisch (Tagesnamen, Fokus, Kategorie, Saetze, Bereich, Reihenfolge)'));
}
compare(4, P4, 'P4'); compare(3, P3, 'P3');
console.log(fails ? `\n${fails} FEHLER, ${warns} Warnungen` : `\nALLE PRUEFUNGEN GRUEN (${warns} Warnungen: lange Einheiten)`);
process.exit(fails ? 1 : 0);
