import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { rooms, books, sceneManifest } from '../lib/immersive';

test('desktop canonical lobby, real camera journeys through all arches, history and direct access', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/experiencia');
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-mode', 'webgl');
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-scene-ready', 'true');
  await expect(page.locator('.lia-reference img')).toBeVisible();
  await page.screenshot({ path: 'test-results/desktop-lobby.png', fullPage: true });
  for (const room of rooms) {
    await page.getByRole('link', { name: `Entrar em ${room.label}`, exact: true }).click();
    await expect(page).toHaveURL(`/experiencia/${room.id}`);
    await expect(page.locator('.lia-room-copy h2')).toHaveText(room.label);
    await expect(page.locator('.lia-canvas')).toHaveClass(/is-active/);
    expect(await page.locator('.lia-canvas canvas').evaluate(canvas => Number((canvas as HTMLElement).dataset.cameraZ))).toBeLessThan(0);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `test-results/desktop-room-${room.id}.png` });
    await page.goBack(); await expect(page).toHaveURL('/experiencia');
  }
  await page.goForward(); await expect(page).toHaveURL('/experiencia/mente-e-calma');
  await page.reload(); await expect(page.locator('.lia-room-copy h2')).toHaveText('Mente & Calma');
  await expect(page.getByRole('link', { name: 'Conhecer a comunidade' })).toHaveAttribute('href', sceneManifest.community.url);
  expect(errors).toEqual([]);
});

test('mobile composition, touch targets, all canonical book routes, no overflow', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/experiencia');
  await expect(page.locator('.lia-mobile-content')).toBeVisible();
  await page.screenshot({ path: 'test-results/mobile-lobby.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const book of books) { const response = await request.get(book.href); expect(response.status()).toBe(200); }
  for (const room of rooms) {
    const link = page.locator('.lia-mobile-door').filter({ hasText: room.label });
    expect((await link.boundingBox())!.width).toBeGreaterThan(44);
  }
  await page.locator('.lia-mobile-door').filter({ hasText: 'Corpo' }).click();
  await expect(page).toHaveURL('/experiencia/corpo');
  await page.screenshot({ path: 'test-results/mobile-room.png', fullPage: true });
});

test('HTML fallback, reduced motion, deep links and commercial pages remain available', async ({ page, request }) => {
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) { if (type.includes('webgl')) return null; return original.call(this, type as '2d', ...args as []) as never; } as typeof original; });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/experiencia');
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-mode', 'html');
  await page.getByRole('link', { name: 'Entrar em EspelhoMeu', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/experiencia/espelho-meu'); await expect(page.locator('.lia-room-fallback')).toBeVisible();
  await page.reload(); await expect(page.locator('.lia-room-copy h2')).toHaveText('EspelhoMeu');
  for (const href of ['/', '/espelho-meu', '/me-sentir-leve', '/corpo', '/mente-e-calma', '/privacidade']) expect((await request.get(href)).status()).toBe(200);
  const checkout = await request.get('/me-sentir-leve/tomei-mounjaro-e-agora'); expect(await checkout.text()).toContain('S108189606N');
});

test('chat real unavailable state, retry, no demo, Escape and focus restoration', async ({ page }) => {
  await page.goto('/experiencia');
  const opener = page.getByRole('button', { name: 'Conversar com a LIA, assistente IA' });
  await opener.click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('A sua mensagem', { exact: true }).fill('Olá, quero conhecer os livros.');
  const responsePromise = page.waitForResponse('/api/lia/chat');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  expect((await responsePromise).status()).toBe(503);
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('LIA temporariamente indisponível');
  await expect(page.locator('.lia-message.assistant')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Usar ditado por voz' })).toHaveCount(0);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(opener).toBeFocused();
});

test('chat controlled 200/429/502 response rendering and cancellation', async ({ page }) => {
  await page.goto('/experiencia'); await page.getByRole('button', { name: 'Abrir conversa com a LIA', exact: true }).click();
  for (const status of [200, 429, 502]) {
    await page.route('**/api/lia/chat', route => route.fulfill({ status, json: status === 200 ? { reply: 'Resposta controlada de teste.' } : { error: 'controlled' } }));
    await page.getByLabel('A sua mensagem', { exact: true }).fill(`Pedido ${status}`); await page.getByRole('button', { name: 'Enviar', exact: true }).click();
    if (status === 200) await expect(page.locator('.lia-message.assistant')).toContainText('Resposta controlada de teste.');
    else await expect(page.getByRole('dialog').getByRole('alert')).toContainText(status === 429 ? 'Limite de mensagens' : 'LIA temporariamente indisponível');
    await page.unroute('**/api/lia/chat');
  }
  await page.route('**/api/lia/chat', async route => { await new Promise(resolve => setTimeout(resolve, 500)); await route.fulfill({ json: { reply: 'Resposta tardia que não deve surgir' } }).catch(() => {}); });
  await page.getByLabel('A sua mensagem', { exact: true }).fill('cancelar'); await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByRole('button', { name: 'Limpar conversa' }).click(); await page.waitForTimeout(700);
  await expect(page.locator('.lia-message')).toHaveCount(0);
});

test('keyboard, search, actual links and automated accessibility desktop/mobile', async ({ page }) => {
  await page.goto('/experiencia');
  expect(await page.locator('a[href="#"]').count()).toBe(0);
  for (const [name, url] of Object.entries(sceneManifest.social)) await expect(page.locator(`.lia-footer a[href="${url}"]`)).toHaveAttribute('rel', 'noopener noreferrer');
  await page.getByRole('button', { name: 'Pesquisar leituras e áreas' }).click(); await page.getByRole('textbox', { name: 'Pesquisar', exact: true }).fill('bela');
  await expect(page.getByRole('dialog').getByRole('link', { name: /Eu Sou Bela/ })).toBeVisible();
  let results = await new AxeBuilder({ page }).analyze(); expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  results = await new AxeBuilder({ page }).analyze(); expect(results.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 }); results = await new AxeBuilder({ page }).analyze(); expect(results.violations).toEqual([]);
});

test('768/1920/360 layouts have no overflow; WebGL context loss falls back without losing the room', async ({ page }) => {
  await page.goto('/experiencia');
  for (const width of [768, 1920, 360]) { await page.setViewportSize({ width, height: width === 1920 ? 1080 : 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/experiencia/corpo');
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-scene-ready', 'true');
  await page.locator('.lia-canvas canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-mode', 'html'); await expect(page.locator('.lia-room-copy h2')).toHaveText('Corpo');
});
