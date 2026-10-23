// Lighthouse-Pruefung der gebauten App (dist/, vorher npm run build): startet vite preview, prueft die Startseite.
// Barrierefreiheit und Best Practices muessen mindestens MIN erreichen; Performance wird nur ausgegeben,
// weil die Werte auf CI-Runnern schwanken. Die Installierbarkeit prueft der E2E-Test (Chrome selbst).
// Chrome: CHROME_PATH (z. B. /opt/pw-browsers/chromium-1194/chrome-linux/chrome in der Sandbox), sonst das installierte Chrome.
// Aufruf: npm run lighthouse
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4175;
const URL = `http://localhost:${PORT}/Gymcreator/`;
const MIN = { accessibility: 0.95, 'best-practices': 0.95 };
const REPORT = path.join(os.tmpdir(), 'gymcreator-lighthouse.json');

const server = spawn(path.join(ROOT, 'node_modules/.bin/vite'), ['preview', '--port', `${PORT}`, '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
let code = 1;
try {
  await waitFor(URL);
  const run = spawnSync(
    path.join(ROOT, 'node_modules/.bin/lighthouse'),
    [URL, '--quiet', '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices', '--output=json', `--output-path=${REPORT}`],
    { cwd: ROOT, stdio: 'inherit' },
  );
  if (run.status !== 0) throw new Error(`Lighthouse beendet mit ${run.status}`);
  const { categories, audits } = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  let fails = 0;
  for (const [id, cat] of Object.entries(categories)) {
    const min = MIN[id];
    const ok = min === undefined || cat.score >= min;
    if (!ok) fails++;
    console.log(`${ok ? '  ok  ' : '  FAIL'} ${id} ${cat.score}${min === undefined ? ' (nur Info)' : ` (min. ${min})`}`);
    if (min !== undefined) {
      for (const ref of cat.auditRefs) {
        const a = audits[ref.id];
        if (ref.weight > 0 && a.score !== null && a.score < 1) console.log(`         - ${a.id}: ${a.title}`);
      }
    }
  }
  console.log(fails ? `LIGHTHOUSE: ${fails} FEHLER` : 'LIGHTHOUSE GRUEN');
  code = fails ? 1 : 0;
} catch (e) {
  console.log(`LIGHTHOUSE FEHLER: ${e.message}`);
} finally {
  server.kill();
}
process.exit(code);

async function waitFor(url) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Server startet noch
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} nicht erreichbar`);
}
