// Erzeugt die App-Icons aus dem Rexy-App-Icon (Marketing-Kit, src/ui/brand/rexy-app-icon-1024.png):
// per Chromium verkleinert nach public/favicon.png (48), apple-touch-icon.png (180), icon-192.png, icon-512.png
// und icon-maskable-512.png (Rex auf 80 % auf Cyan, damit runde Masken die Schnauze nicht abschneiden).
// Aufruf: node scripts/make-icons.mjs  (Chromium: Playwright-Standard oder PW_CHROMIUM_PATH)
// Ergebnis wird eingecheckt; nur neu laufen lassen, wenn sich die Marke aendert.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const SOURCE = path.join(ROOT, 'src/ui/brand/rexy-app-icon-1024.png');
// Randfarbe des Icons (gemessen, etwas heller als --cyan), fuellt beim maskierbaren Icon den Rand
const EDGE = '#01F0FD';
// Anteil des Icons im maskierbaren Icon: Android schneidet bis auf einen Kreis mit 80 % Durchmesser zu
const MASKABLE_SCALE = 0.8;

const src = 'data:image/png;base64,' + fs.readFileSync(SOURCE).toString('base64');

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage();
for (const [file, size, scale] of [
  ['favicon.png', 48, 1],
  ['apple-touch-icon.png', 180, 1],
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['icon-maskable-512.png', 512, MASKABLE_SCALE],
]) {
  const inner = Math.round(size * scale);
  const pad = (size - inner) / 2;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:${EDGE}">` +
      `<img src="${src}" width="${inner}" height="${inner}" style="display:block;margin:${pad}px">` +
      `</body></html>`,
  );
  await page.screenshot({ path: path.join(PUB, file), clip: { x: 0, y: 0, width: size, height: size } });
  console.log('geschrieben: public/' + file);
}
await browser.close();
