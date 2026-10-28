import { expect, test } from '@playwright/test';
import { shelves } from '../lib/shelves';

test('each themed room shows its own shelf; selection opens the sheet with checkout and sales page', async ({ page }) => {
  for (const [room, shelf] of Object.entries(shelves)) {
    await page.goto(`/experiencia/${room}`);
    await expect(page.locator('.lia-experience')).toHaveAttribute('data-scene-ready', 'true');
    if (!shelf.items.length) { await expect(page.locator('.lia-library')).toHaveCount(0); continue; }
    await expect(page.getByRole('heading', { name: shelf.heading })).toBeVisible();
    for (const item of shelf.items) await expect(page.locator(`[data-volume="${item.slug}"] img`)).toHaveAttribute('src', /editorial%2Fcovers|editorial\/covers/);
    const item = shelf.items[0];
    await page.locator(`[data-volume="${item.slug}"]`).click();
    await expect(page).toHaveURL(`/experiencia/${room}/${item.slug}`);
    await expect(page.locator(`.lia-canvas canvas[data-book-state="${item.slug}"]`)).toHaveCount(1, { timeout: 60_000 });
    const sheet = page.getByRole('dialog', { name: item.title });
    await expect(sheet.getByRole('link', { name: 'Comprar na Hotmart' })).toHaveAttribute('href', item.checkout);
    await expect(sheet.getByRole('link', { name: /Ver a página completa do livro/ })).toHaveAttribute('href', `/livros/${item.slug}`);
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(`/experiencia/${room}`);
  }
});

test('room deep links validate against the shelf', async ({ request }) => {
  expect((await request.get('/experiencia/me-sentir-leve/tomei-mounjaro-e-agora')).status()).toBe(200);
  expect((await request.get('/experiencia/corpo/corpo-forte-alem-da-balanca')).status()).toBe(200);
  expect((await request.get('/experiencia/corpo/tomei-mounjaro-e-agora')).status()).toBe(404);
  expect((await request.get('/experiencia/mente-e-calma/tomei-mounjaro-e-agora')).status()).toBe(404);
});
