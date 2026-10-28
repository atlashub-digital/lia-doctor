import { expect, test } from '@playwright/test';

test('homepage is the LIA átrio, indexable, canonical on www; the shop lives at /colecoes', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.lia-experience')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: /LIA\.doctor — A companheira da sua jornada/ })).toBeAttached();
  await expect(page).toHaveTitle('LIA.doctor — A companheira da sua jornada');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.lia.doctor');
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0);
  await page.goto('/experiencia');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.lia.doctor');
  await page.goto('/colecoes');
  await expect(page.getByRole('heading', { name: /Há histórias que nos ajudam/ })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.lia.doctor/colecoes');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://www.lia.doctor</loc>');
  expect(sitemap).toContain('<loc>https://www.lia.doctor/colecoes</loc>');
  expect(sitemap).not.toMatch(/<loc>https:\/\/lia\.doctor/);
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://www.lia.doctor/sitemap.xml');
});

test('door from the homepage keeps the same 3D canvas into the room, and the room returns to "/"', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-scene-ready', 'true');
  await page.locator('.lia-canvas canvas').evaluate(canvas => { (canvas as HTMLCanvasElement & { __marker?: number }).__marker = 1; });
  await page.getByRole('link', { name: 'Entrar em EspelhoMeu', exact: true }).click();
  await expect(page).toHaveURL('/experiencia/espelho-meu');
  await expect(page.locator('.lia-room-copy h2')).toHaveText('EspelhoMeu');
  expect(await page.locator('.lia-canvas canvas').evaluate(canvas => (canvas as HTMLCanvasElement & { __marker?: number }).__marker)).toBe(1);
  await page.getByRole('link', { name: '← Voltar ao átrio' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.lia-room-copy')).toHaveCount(0);
});

test('shop header leads back to the house and to /colecoes', async ({ page }) => {
  await page.goto('/me-sentir-leve');
  await expect(page.getByRole('link', { name: 'Visitar a casa LIA' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Coleções' })).toHaveAttribute('href', '/colecoes');
});
