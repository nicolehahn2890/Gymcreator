import { chromium, expect, test, type Locator, type Page } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function onboard(page: Page, goal: string, days: number) {
  await page.goto('./');
  await page.getByRole('button', { name: new RegExp(goal) }).click();
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByRole('button', { name: new RegExp(`^${days} Tage`) }).click();
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByRole('button', { name: 'Weiter' }).click();
  await expect(page.getByRole('heading', { name: 'Dein Wochenplan' })).toBeVisible();
  await page.getByRole('button', { name: 'Plan starten' }).click();
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

/** Startseite (Reiter "Plan") mit aufgeklappten Uebungen; bleibt aufgeklappt, bis man sie ausblendet. */
async function showPlan(page: Page) {
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Diese Woche' })).toBeVisible();
  const toggle = page.getByRole('button', { name: 'Übungen anzeigen' });
  if (await toggle.isVisible()) await toggle.click();
  await expect(page.getByRole('button', { name: 'Übungen ausblenden' })).toBeVisible();
}

test('Onboarding fuehrt zum Plan, keine waagerechte Scrollleiste, kein Fremdname', async ({ page }) => {
  await onboard(page, 'Apfel', 4);
  await expect(page.locator('.wordmark')).toHaveText('Rexy');
  await expect(page.locator('.tab')).toHaveText(['Plan', 'Fortschritt', 'Einstellungen']);
  await expect(page.getByRole('heading', { name: /Tag A/ })).toBeVisible();
  await expect(page.getByText('Zyklus 1 · Woche 1 von 12')).toBeVisible();
  await noOverflow(page);
  for (const tab of ['Plan', 'Fortschritt', 'Einstellungen']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await noOverflow(page);
  }
  await expect(page.getByText(/peach/i)).toHaveCount(0);
});

test('Plan: Uebungen der Woche bei Bedarf aufklappen, bleiben aufgeklappt bis zum Ausblenden', async ({ page }) => {
  await onboard(page, 'Apfel', 4);
  await expect(page.locator('.day-row')).toHaveCount(4);
  await expect(page.locator('.day-row-exercise')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Trainingstage in dieser Woche' })).toHaveCount(0);
  await showPlan(page);
  await expect(page.locator('.day-row').first().locator('.day-row-exercise').first()).toContainText('Glute Max');
  await expect(page.getByRole('group', { name: 'Trainingstage in dieser Woche' }).getByRole('button', { name: '4 Tage' })).toHaveAttribute('aria-pressed', 'true');
  await noOverflow(page);
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await expect(page.locator('.day-row-exercise').first()).toBeVisible();
  await page.getByRole('button', { name: 'Übungen ausblenden' }).click();
  await expect(page.locator('.day-row-exercise')).toHaveCount(0);
});

test('Training: Uebung frei waehlen, Werte bleiben nach Neuladen, Woche 2 zeigt Vorwoche, Hinweis und Bewertung', async ({ page }) => {
  await onboard(page, 'Apfel', 4);
  await page.getByRole('button', { name: 'Training starten' }).click();
  // erste Uebung ist aufgeklappt, aber ohne Vorgabe
  const first = page.locator('.exercise-item').first();
  await expect(first.locator('.exercise-row')).toHaveAttribute('aria-expanded', 'true');
  await expect(first.locator('.exercise-row')).toContainText('Übung wählen');
  await first.getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Langhantel)' }).click();
  await expect(first.locator('.exercise-row-name')).toHaveText('Hip Thrust (Langhantel)');

  const inputs = first.locator('.set-row input');
  await inputs.nth(0).fill('100');
  await inputs.nth(1).fill('8');
  // Pause nur auf Knopfdruck
  await expect(page.getByRole('timer')).toHaveCount(0);
  await first.getByRole('button', { name: /^Pause starten/ }).click();
  await expect(page.getByRole('timer')).toBeVisible();

  await page.reload();
  await expect(first.locator('.set-row input').nth(0)).toHaveValue('100');
  await expect(first.locator('.set-row input').nth(2)).toHaveValue('100');
  await expect(first.locator('.set-row input').nth(1)).toHaveValue('8');

  // zuklappen und wieder aufklappen
  await first.locator('.exercise-row').click();
  await expect(first.locator('.set-row')).toHaveCount(0);
  await first.locator('.exercise-row').click();
  await expect(first.locator('.set-row input').nth(0)).toHaveValue('100');

  // Woche 2 direkt auf der Startseite: Vorwoche je Satz, Steigerungshinweis (8 von 6-8 im 1. Satz), Bewertung im Kopf
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await expect(page.getByText('Zyklus 1 · Woche 2 von 12')).toBeVisible();
  await page.getByRole('button', { name: 'Training starten' }).click();
  await expect(first.locator('.exercise-row-name')).toHaveText('Hip Thrust (Langhantel)');
  await expect(first.locator('.set-head')).toContainText('Vorwoche');
  await expect(first.locator('.set-prev').first()).toHaveText('100 \u00d7 8');
  await expect(first.getByText('Gewicht steigern: heute 102,5 kg')).toBeVisible();
  await first.locator('.set-row input').nth(0).fill('102,5');
  await first.locator('.set-row input').nth(1).fill('8');
  await expect(first.locator('.exercise-row').getByText('Mehr Gewicht')).toBeVisible();
  await expect(first.getByText('Gewicht steigern: heute 102,5 kg')).toHaveCount(0);
  await noOverflow(page);
});

test('Uebung tauschen ab Woche 2 fragt "nur diese Woche" oder "ab jetzt"', async ({ page }) => {
  await onboard(page, 'Sanduhr', 3);
  await page.getByRole('button', { name: 'Training starten' }).click();
  const first = page.locator('.exercise-item').first();
  await first.getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Langhantel)' }).click();
  await first.locator('.set-row input').nth(0).fill('80');
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await page.locator('.day-row').first().click();
  await first.getByRole('button', { name: 'Übung tauschen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Maschine)' }).click();
  await expect(page.getByRole('dialog', { name: 'Übung wechseln' })).toBeVisible();
  await page.getByRole('button', { name: 'Nur diese Woche' }).click();
  await expect(first.locator('.exercise-row-name')).toHaveText('Hip Thrust (Maschine)');
  await expect(first.locator('.exercise-row').getByText('nur diese Woche')).toBeVisible();
});

test('Satz entfernen loescht den Wert, Trainingstage in den Einstellungen gelten ab der aktuellen Woche', async ({ page }) => {
  await onboard(page, 'Apfel', 4);
  await page.getByRole('button', { name: 'Training starten' }).click();
  const first = page.locator('.exercise-item').first();
  await first.getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Langhantel)' }).click();
  await first.getByRole('button', { name: 'Satz hinzufügen' }).click();
  await expect(first.locator('.set-row input')).toHaveCount(8);
  await first.locator('.set-row input').nth(6).fill('120');
  await first.getByRole('button', { name: 'Satz entfernen' }).click();
  await first.getByRole('button', { name: 'Satz hinzufügen' }).click();
  await expect(first.locator('.set-row input').nth(6)).toHaveValue('');

  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('group', { name: 'Trainingstage pro Woche' }).getByRole('button', { name: '3 Tage' }).click();
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await expect(page.locator('.day-row')).toHaveCount(3);
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await expect(page.locator('.day-row')).toHaveCount(3);
});

test('Einstellungen: fielen eingetragene Uebungen weg, gelten neue Tage ab naechster Woche; Uebung entfernen loescht die Werte; Halteuebung im Plan', async ({ page }) => {
  await onboard(page, 'Apfel', 4);
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.locator('.day-row').nth(1).click();
  // Tag B, 2. Zeile (Brust) gibt es im 3-Tage-Plan nicht
  const chest = page.locator('.exercise-item').nth(1);
  await expect(chest.locator('.exercise-row-cat')).toContainText('Brust');
  await chest.locator('.exercise-row').click();
  await pickExercise(page, chest, 'Brustpresse (Maschine)');
  await fillSets(chest, '20', '10');

  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('group', { name: 'Trainingstage pro Woche' }).getByRole('button', { name: '3 Tage' }).click();
  await expect(page.getByText('Gilt ab nächster Woche')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Trainingstage pro Woche' }).getByRole('button', { name: '3 Tage' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await expect(page.locator('.day-row')).toHaveCount(4);
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await expect(page.locator('.day-row')).toHaveCount(3);

  await page.getByRole('button', { name: 'Vorherige Woche' }).click();
  await page.locator('.day-row').nth(1).click();
  await chest.locator('.exercise-row').click();
  await chest.getByRole('button', { name: 'Übung tauschen' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Übung entfernen' }).click();
  await expect(chest.locator('.exercise-row-name')).toHaveText('Übung wählen');
  await page.getByRole('button', { name: 'Fortschritt', exact: true }).click();
  await expect(page.getByText('Dein Verlauf erscheint hier, sobald du Werte eingetragen hast.')).toBeVisible();

  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.locator('.day-row').first().click();
  const abs = page.locator('.exercise-item').nth(5);
  await expect(abs.locator('.exercise-row-cat')).toHaveText('Bauch');
  await abs.locator('.exercise-row').click();
  await pickExercise(page, abs, 'Unterarmstütz');
  await expect(abs.locator('.exercise-row')).toContainText('2 Sätze halten');
  await page.getByRole('button', { name: 'Zurück' }).click();
  await showPlan(page);
  await expect(page.locator('.day-row').first().locator('.day-row-exercise').last()).toContainText('2 Sätze halten');
});

test('Backup: einspielen ersetzt die Daten nach Rueckfrage', async ({ page }) => {
  await onboard(page, 'V-Form', 3);
  await page.getByRole('button', { name: 'Einstellungen' }).click();
  await page.getByLabel('Backup-Text einfügen').fill('kein backup');
  await page.getByRole('button', { name: 'Backup einspielen' }).click();
  await expect(page.getByText('Das ist kein vollständiger Backup-Text.')).toBeVisible();

  const text = JSON.stringify({
    app: 'gymcreator',
    schema: 1,
    date: '2026-10-23',
    profile: { goal: 'apfel', days: 4, equipment: ['machine', 'bodyweight'], increments: {}, lang: 'de', createdAt: '2026-10-01' },
    entries: [],
    weeks: [],
    notes: [],
    custom: [],
  });
  await page.getByLabel('Backup-Text einfügen').fill(text);
  await page.getByRole('button', { name: 'Backup einspielen' }).click();
  await expect(page.getByRole('dialog', { name: 'Backup einspielen?' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Backup einspielen' }).click();
  await expect(page.getByText('Backup eingespielt.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apfel' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/Stand vor dem letzten Einspielen/)).toBeVisible();
});

test('Manifest ist erreichbar und standalone', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const res = await request.get(new URL(href ?? '', page.url()).toString());
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.name).toBe('Rexy');
});

test('Chrome haelt die App fuer installierbar', async ({ baseURL }) => {
  // Eigenes Profil statt Inkognito-Kontext, sonst meldet Chrome immer "in-incognito"
  const context = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'gymcreator-')), test.info().project.use.launchOptions);
  const page = await context.newPage();
  await page.goto(baseURL ?? '');
  const cdp = await context.newCDPSession(page);
  await expect.poll(async () => (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors, { timeout: 10_000 }).toEqual([]);
  await context.close();
});

test('startet offline, sobald der Service Worker aktiv ist', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // erst nach einem Neuladen kontrolliert der Service Worker die Seite
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Welche Körperform ist dein Ziel?' })).toBeVisible();
  await context.setOffline(false);
});

async function pickExercise(page: Page, item: Locator, name: string) {
  await item.getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name }).click();
}

async function fillSets(item: Locator, weight: string, reps: string) {
  const inputs = item.locator('.set-row input');
  const n = await inputs.count();
  for (let i = 0; i < n; i += 2) {
    await inputs.nth(i).fill(weight);
    await inputs.nth(i + 1).fill(reps);
  }
}

async function nextWeekViaPlan(page: Page) {
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
}

test('Logo fuehrt von jeder Seite zurueck auf die Startseite', async ({ page }) => {
  await onboard(page, 'Apfel', 3);
  for (const tab of ['Plan', 'Fortschritt', 'Einstellungen']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await page.getByRole('button', { name: 'Zur Startseite' }).click();
    await expect(page.getByRole('button', { name: 'Training starten' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Training starten' }).click();
  await expect(page.locator('.exercise-item').first()).toBeVisible();
  await page.getByRole('button', { name: 'Zur Startseite' }).click();
  await expect(page.getByRole('button', { name: 'Training starten' })).toBeVisible();
});

test('Plan: Umstellen auf 3 Tage fragt nach, wenn Werte wegfallen; Zurueckstellen bringt sie wieder', async ({ page }) => {
  await onboard(page, 'Apfel', 4);
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.locator('.day-row').nth(3).click();
  // Tag D, 2. Zeile (Glute Max) gibt es im 3-Tage-Plan nicht
  const dayD = page.locator('.exercise-item').nth(1);
  await expect(dayD.locator('.exercise-row-cat')).toHaveText('Glute Max');
  await dayD.locator('.exercise-row').click();
  await pickExercise(page, dayD, 'Glute Bridge (Langhantel)');
  await fillSets(dayD, '70', '10');
  await page.getByRole('button', { name: 'Zurück' }).click();
  await showPlan(page);
  await page.getByRole('button', { name: '3 Tage' }).click();
  await expect(page.getByRole('dialog', { name: 'Woche 1 auf 3 Tage umstellen?' })).toBeVisible();
  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(page.locator('.day-row')).toHaveCount(4);
  await page.getByRole('button', { name: '3 Tage' }).click();
  await page.getByRole('button', { name: 'Umstellen' }).click();
  await expect(page.locator('.day-row')).toHaveCount(3);
  await expect(page.getByText('Glute Bridge (Langhantel)')).toHaveCount(0);
  await page.getByRole('button', { name: '4 Tage' }).click();
  await expect(page.locator('.day-row')).toHaveCount(4);
  await page.locator('.day-row').nth(3).click();
  // die erledigte Uebung ist zu, aufgeklappt ist die erste offene
  await expect(page.locator('.exercise-item').first().locator('.exercise-row')).toHaveAttribute('aria-expanded', 'true');
  const done = page.locator('.exercise-item').nth(1);
  await expect(done.locator('.exercise-row')).toHaveAttribute('aria-expanded', 'false');
  await done.locator('.exercise-row').click();
  await expect(done.locator('.set-row input').first()).toHaveValue('70');
});

test('Eigene Uebung ueber zwei Wochen, langer Name ohne Ueberlauf, Fortschritt rechnet richtig', async ({ page }) => {
  const name = 'Hüftstrecken am Kabel mit Fußschlaufe, kniend auf der Bank, langsame Ausführung';
  await onboard(page, 'Apfel', 3);
  await page.getByRole('button', { name: 'Training starten' }).click();
  const first = page.locator('.exercise-item').first();
  const second = page.locator('.exercise-item').nth(1);
  await pickExercise(page, first, 'Hip Thrust (Langhantel)');
  await fillSets(first, '100', '8');
  await second.locator('.exercise-row').click();
  await second.getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByLabel('Eigene Übung anlegen').fill(name);
  await page.getByRole('button', { name: 'Anlegen', exact: true }).click();
  await expect(second.locator('.exercise-row-name')).toHaveText(name);
  await fillSets(second, '30', '12');
  await noOverflow(page);

  for (const [w, own] of [['102,5', '32,5'], ['105', '35']] as const) {
    await nextWeekViaPlan(page);
    await page.getByRole('button', { name: 'Training starten' }).click();
    await expect(first.locator('.exercise-row-name')).toHaveText('Hip Thrust (Langhantel)');
    await fillSets(first, w, '8');
    await second.locator('.exercise-row').click();
    await expect(second.locator('.exercise-row-name')).toHaveText(name);
    await expect(second.locator('.set-head')).toContainText('Vorwoche');
    await fillSets(second, own, '12');
    await expect(second.locator('.exercise-row').getByText('Mehr Gewicht')).toBeVisible();
    await page.getByRole('button', { name: 'Zur Startseite' }).click();
  }

  await page.getByRole('button', { name: 'Fortschritt', exact: true }).click();
  const ht = page.locator('.progress-card', { hasText: 'Hip Thrust (Langhantel)' });
  await expect(ht.getByText('+5 kg')).toBeVisible();
  await expect(ht.locator('.bar-fill[style*="height"]:not([style*="height: 0%"])')).toHaveCount(3);
  await expect(page.locator('.progress-card', { hasText: name }).getByText('+5 kg')).toBeVisible();
  await noOverflow(page);

  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await expect(page.locator('.custom-list')).toContainText(name);
  await expect(page.locator('.custom-list').getByRole('button', { name: 'Löschen' })).toHaveCount(0);
  await noOverflow(page);
});

test('Bedienbarkeit: Knoepfe und Felder haben Namen, aufgeklappt ist ausgezeichnet', async ({ page }) => {
  await onboard(page, 'V-Form', 4);
  await page.getByRole('button', { name: 'Training starten' }).click();
  const first = page.locator('.exercise-item').first();
  await pickExercise(page, first, 'Klimmzug assistiert breit');
  await expect(first.locator('.exercise-row')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Satz 1, Hilfe kg')).toBeVisible();
  await expect(page.getByLabel('Satz 1, Wdh.')).toBeVisible();
  for (const screen of ['Training', 'Plan', 'Fortschritt', 'Einstellungen']) {
    if (screen === 'Plan') await showPlan(page);
    else if (screen !== 'Training') await page.getByRole('button', { name: screen, exact: true }).click();
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('button, input, textarea')]
        .filter((el) => {
          const label = el.getAttribute('aria-label') || (el as HTMLElement).innerText.trim() || (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest('label');
          return !label;
        })
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(unnamed, screen).toEqual([]);
  }
});

test('Kein Deload: Plan erklaert den leichteren Start, Woche 12 und Zyklus 2 erinnern daran', async ({ page }) => {
  await onboard(page, 'Sanduhr', 3);
  await showPlan(page);
  await expect(page.getByText('Ein Zyklus hat 12 Wochen, eine Pause-Woche gibt es nicht. Im nächsten Zyklus startest du mit 5–10 % weniger Gewicht und steigerst dich wieder.')).toBeVisible();
  await page.locator('.week-label').click();
  await page.getByRole('dialog').getByRole('button', { name: /^12/ }).click();
  await page.getByRole('button', { name: 'Zur Startseite' }).click();
  await expect(page.getByText(/Zyklus 2 übernimmt deine Übungen; dort startest du mit etwas weniger Gewicht/)).toBeVisible();
  // der allgemeine Zyklus-Hinweis in der Liste steht dann nicht noch einmal da
  await expect(page.getByText(/Ein Zyklus hat 12 Wochen/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await page.getByRole('button', { name: 'Zur Startseite' }).click();
  await expect(page.getByText('Zyklus 2 · Woche 1 von 12')).toBeVisible();
  await expect(page.getByText(/Woche 1 von Zyklus 2: Starte mit 5–10 % weniger Gewicht als zuletzt/)).toBeVisible();
});

test('Plan neu einrichten: aus den Einstellungen, Abbrechen aendert nichts, Verlauf bleibt', async ({ page }) => {
  await onboard(page, 'Apfel', 4);
  await page.getByRole('button', { name: 'Training starten' }).click();
  const first = page.locator('.exercise-item').first();
  await first.getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Langhantel)' }).click();
  await fillSets(first, '100', '8');

  // Einstellungen: Assistent oeffnen und abbrechen
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('button', { name: 'Plan neu einrichten' }).click();
  await expect(page.getByRole('button', { name: /Apfel/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible();

  // Ziel wechseln und uebernehmen: danach die Startseite mit dem neuen Plan
  await page.getByRole('button', { name: 'Plan neu einrichten' }).click();
  await page.getByRole('button', { name: /Sanduhr/ }).click();
  for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: 'Weiter' }).click();
  await expect(page.getByText('Dein Verlauf bleibt erhalten.')).toBeVisible();
  await page.getByRole('button', { name: 'Übernehmen' }).click();
  await expect(page.getByText('Zyklus 1 · Woche 1 von 12')).toBeVisible();
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await expect(page.getByRole('button', { name: /Sanduhr/ })).toHaveAttribute('aria-pressed', 'true');

  // zurueck auf Apfel: die eingetragenen Werte sind noch da
  await page.getByRole('button', { name: 'Plan neu einrichten' }).click();
  await page.getByRole('button', { name: /Apfel/ }).click();
  for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByRole('button', { name: 'Übernehmen' }).click();
  await showPlan(page);
  await expect(page.locator('.day-row').first()).toContainText('Hip Thrust (Langhantel)');
  await noOverflow(page);
});

test('Kurz-Modus "30-45 Min.": 4 Uebungen fuers Ziel mit allen Saetzen und normaler Pause, der Rest unten machbar; Normal stellt zurueck', async ({ page }) => {
  await onboard(page, 'Apfel', 3);
  await expect(page.getByText('7 Übungen · ca. 70 Min.')).toBeVisible();
  await page.getByRole('button', { name: 'Training starten' }).click();
  const time = page.getByRole('group', { name: 'Zeit heute' });
  await expect(time.getByRole('button')).toHaveText(['Normal', '30–45 Min.']);
  await expect(time.getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('ca. 70 Min.')).toBeVisible();

  await time.getByRole('button', { name: '30–45 Min.' }).click();
  await expect(page.getByText('ca. 45 Min.')).toBeVisible();
  await expect(page.getByText('Die wichtigsten Übungen für dein Ziel, mit allen Sätzen. Die übrigen stehen unten und sind heute freiwillig.')).toBeVisible();
  // oben die 4 Po- und Beinuebungen mit allen Saetzen, unten Ruecken, Schultern und Bauch
  const main = page.locator('main > .exercise-list > .exercise-item');
  await expect(main.locator('.exercise-row-cat')).toHaveText(['Glute Max', 'Glute & Quad', 'Glute Med', 'Adduktoren']);
  await expect(main.locator('.exercise-row .muted')).toHaveText(['3 × 6–8 Wdh.', '3 × 6–10 Wdh.', '3 × 8–12 Wdh.', '2 × 8–12 Wdh.']);
  const skipped = page.getByRole('region', { name: 'Heute ausgelassen' });
  await expect(skipped.locator('.exercise-row-cat')).toHaveText(['Rücken · Ziehen von oben', 'Schultern · Hintere Schulter', 'Bauch']);

  // normale Pause, nichts heimlich gekuerzt
  await main.first().getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Langhantel)' }).click();
  await expect(main.first().getByRole('button', { name: 'Pause starten (3:00)' })).toBeVisible();

  // eine ausgelassene Uebung laesst sich trotzdem eintragen
  const extra = skipped.locator('.exercise-item').first();
  await extra.locator('.exercise-row').click();
  await expect(extra.getByRole('button', { name: 'Übung wählen', exact: true })).toBeVisible();

  // Plan zeigt den Kurz-Modus am Tag A und die ausgelassenen Uebungen
  await showPlan(page);
  const dayA = page.locator('.day-row').first();
  await expect(dayA.getByText('Kurz-Modus: 30–45 Min.')).toBeVisible();
  await expect(dayA.getByText('ausgelassen')).toHaveCount(3);
  await expect(page.getByText('Kurz-Modus: 30–45 Min.')).toHaveCount(1);
  await page.getByRole('button', { name: 'Zur Startseite' }).click();
  await expect(page.locator('.next-meta')).toHaveText('4 Übungen · ca. 45 Min.');
  await page.getByRole('button', { name: 'Training starten' }).click();

  // bleibt nach Neuladen; Normal stellt zurueck
  await page.reload();
  await expect(time.getByRole('button', { name: '30–45 Min.' })).toHaveAttribute('aria-pressed', 'true');
  await time.getByRole('button', { name: 'Normal' }).click();
  await expect(page.getByText('ca. 70 Min.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Heute ausgelassen' })).toHaveCount(0);
  await expect(main).toHaveCount(7);
  await noOverflow(page);
});

test('Kurz-Modus: auch Einheiten mit 60 Min. bieten nur "30-45 Min." an', async ({ page }) => {
  await onboard(page, 'Apfel', 3);
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.locator('.day-row').nth(1).click();
  await expect(page.getByText('ca. 60 Min.')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Zeit heute' }).getByRole('button')).toHaveText(['Normal', '30–45 Min.']);
});
