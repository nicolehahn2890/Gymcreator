import { expect, test } from '@playwright/test';

test('Startseite zeigt Wortmarke und die drei Ziele', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'Gymcreator' })).toBeVisible();
  for (const name of ['V-Form', 'Sanduhr', 'Apfel']) {
    await expect(page.getByRole('heading', { level: 3, name })).toBeVisible();
  }
  await expect(page.getByText('Peach')).toHaveCount(0);
});

test('keine waagerechte Scrollleiste', async ({ page }) => {
  await page.goto('./');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('Manifest ist erreichbar und standalone', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const res = await request.get(new URL(href ?? '', page.url()).toString());
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.name).toBe('Gymcreator');
});
