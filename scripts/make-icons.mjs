// Erzeugt die App-Icons aus dem Pixel-Muster in src/ui/brand/pixels.ts:
// public/favicon.svg, public/icon.svg und daraus per Chromium die PNGs (192, 512, maskable 512, Apple 180).
// Aufruf: node scripts/make-icons.mjs  (Chromium: Playwright-Standard oder PW_CHROMIUM_PATH)
// Ergebnis wird eingecheckt; nur neu laufen lassen, wenn sich die Marke aendert.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { DUMBBELL, pixelRuns } from '../src/ui/brand/pixels.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
// Farben der Marke vor Rexy; Icon und Favicon werden mit der Store-Vorbereitung neu gestaltet
const INK = '#181016';
const CREAM = '#FBF3E7';
const YELLOW = '#F5CB44';

function dumbbell(scale, offset) {
  return pixelRuns(DUMBBELL)
    .map(({ x, y, w }) => `<rect x="${offset + x * scale}" y="${offset + y * scale}" width="${w * scale}" height="${scale}"/>`)
    .join('');
}

// Favicon: Cream-Kreis mit Ink-Rahmen, transparent aussen
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
<circle cx="16" cy="16" r="14.75" fill="${CREAM}" stroke="${INK}" stroke-width="2.5" shape-rendering="geometricPrecision"/>
<g fill="${INK}">${dumbbell(1.5, 4)}</g>
</svg>
`;

// App-Icon: volle gelbe Flaeche (Store/Homescreen schneiden selbst zu), Kreis innerhalb der Maskable-Sicherheitszone
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges">
<rect width="64" height="64" fill="${YELLOW}"/>
<circle cx="32" cy="32" r="22" fill="${CREAM}" stroke="${INK}" stroke-width="2.5" shape-rendering="geometricPrecision"/>
<g fill="${INK}">${dumbbell(2, 16)}</g>
</svg>
`;

fs.mkdirSync(PUB, { recursive: true });
fs.writeFileSync(path.join(PUB, 'favicon.svg'), favicon);
fs.writeFileSync(path.join(PUB, 'icon.svg'), icon);

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage();
const src = 'data:image/svg+xml;base64,' + Buffer.from(icon).toString('base64');
for (const [file, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0"><img src="${src}" width="${size}" height="${size}" style="display:block"></body></html>`);
  await page.screenshot({ path: path.join(PUB, file), clip: { x: 0, y: 0, width: size, height: size } });
  console.log('geschrieben: public/' + file);
}
await browser.close();
