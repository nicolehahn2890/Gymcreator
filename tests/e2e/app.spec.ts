import { expect, test, type Page } from '@playwright/test';

async function onboard(page: Page, goal: string, level: string, days: number) {
  await page.goto('./');
  await page.getByRole('button', { name: new RegExp(goal) }).click();
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByRole('button', { name: new RegExp(level) }).click();
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

test('Onboarding fuehrt zum Plan, keine waagerechte Scrollleiste, kein Fremdname', async ({ page }) => {
  await onboard(page, 'Apfel', 'Fortgeschritten', 4);
  await expect(page.getByRole('heading', { name: /Tag A/ })).toBeVisible();
  await expect(page.getByText('Zyklus 1 · Woche 1 von 12')).toBeVisible();
  await noOverflow(page);
  for (const tab of ['Plan', 'Fortschritt', 'Einstellungen']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await noOverflow(page);
  }
  await expect(page.getByText(/peach/i)).toHaveCount(0);
});

test('Training: Uebung frei waehlen, Werte bleiben nach Neuladen, Woche 2 zeigt Vorwoche, Hinweis und Bewertung', async ({ page }) => {
  await onboard(page, 'Apfel', 'Fortgeschritten', 4);
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

  // Woche 2: Vorwoche je Satz, Steigerungshinweis (8 von 6-8 im 1. Satz), Bewertung im Kopf
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await page.getByRole('button', { name: 'Heute', exact: true }).click();
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
  await onboard(page, 'Sanduhr', 'Fortgeschritten', 3);
  await page.getByRole('button', { name: 'Training starten' }).click();
  const first = page.locator('.exercise-item').first();
  await first.getByRole('button', { name: 'Übung wählen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Langhantel)' }).click();
  await first.locator('.set-row input').nth(0).fill('80');
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await page.locator('.plan-day').first().click();
  await first.getByRole('button', { name: 'Übung tauschen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hip Thrust (Maschine)' }).click();
  await expect(page.getByRole('dialog', { name: 'Übung wechseln' })).toBeVisible();
  await page.getByRole('button', { name: 'Nur diese Woche' }).click();
  await expect(first.locator('.exercise-row-name')).toHaveText('Hip Thrust (Maschine)');
  await expect(first.locator('.exercise-row').getByText('nur diese Woche')).toBeVisible();
});

test('Satz entfernen loescht den Wert, Trainingstage in den Einstellungen gelten ab der aktuellen Woche', async ({ page }) => {
  await onboard(page, 'Apfel', 'Fortgeschritten', 4);
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
  await page.locator('.segmented').nth(2).getByRole('button', { name: '3 Tage' }).click();
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await expect(page.locator('.plan-day')).toHaveCount(3);
  await page.getByRole('button', { name: 'Nächste Woche' }).click();
  await expect(page.locator('.plan-day')).toHaveCount(3);
});

test('Backup: einspielen ersetzt die Daten nach Rueckfrage', async ({ page }) => {
  await onboard(page, 'V-Form', 'Einsteiger', 3);
  await page.getByRole('button', { name: 'Einstellungen' }).click();
  await page.getByLabel('Backup-Text einfügen').fill('kein backup');
  await page.getByRole('button', { name: 'Backup einspielen' }).click();
  await expect(page.getByText('Das ist kein vollständiger Backup-Text.')).toBeVisible();

  const text = JSON.stringify({
    app: 'gymcreator',
    schema: 1,
    date: '2026-10-23',
    profile: { goal: 'apfel', level: 'advanced', days: 4, equipment: ['machine', 'bodyweight'], increments: {}, lang: 'de', createdAt: '2026-10-01' },
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
  expect(manifest.name).toBe('Gymcreator');
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
