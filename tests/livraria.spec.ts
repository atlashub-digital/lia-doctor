import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { espelhoOffers } from '../lib/offers';

const P01 = espelhoOffers[0], P02 = espelhoOffers[1];
const roomUrl = '/experiencia/espelho-meu';
const presented = (page: Page, slug: string) => page.locator(`.lia-canvas canvas[data-book-state="${slug}"]`);
const noWebgl = () => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) { if (type.includes('webgl')) return null; return original.call(this, type as '2d', ...args as []) as never; } as typeof original; };

// Hotmart products supplied by the Direction on 28/10/2026.
const checkouts = { P01: 'A108182228Y', P02: 'A108182278G', P03: 'E108183347V', P04: 'D108183354F', P05: 'E108186873J' } as const;

test('offer catalogue: each volume sells through its Direction-supplied Hotmart checkout', () => {
  expect(espelhoOffers.map(offer => offer.productCode)).toEqual(['P01', 'P02', 'P03', 'P04', 'P05']);
  for (const offer of espelhoOffers) {
    expect(offer.commerce).toMatchObject({ status: 'live', checkout: `https://pay.hotmart.com/${checkouts[offer.productCode]}`, hotlink: `https://go.hotmart.com/${checkouts[offer.productCode]}?dp=1`, widget: { enabled: false } });
    expect(offer.synopsis.length).toBeGreaterThan(80);
    expect(offer.notice.length).toBeGreaterThan(10);
    expect(offer.cover.status).toBe('pending-editorial');
  }
  expect(JSON.stringify(espelhoOffers)).not.toContain('espelho.lia.doctor');
});

test('select P01 from the library: book presented, sheet, Hotmart CTA, Escape returns it, history and refresh', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(roomUrl);
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-scene-ready', 'true');
  await page.locator(`[data-volume="${P01.slug}"]`).click();
  await expect(page).toHaveURL(`${roomUrl}/${P01.slug}`);
  const sheet = page.getByRole('dialog', { name: P01.title });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('heading', { name: P01.title })).toBeFocused();
  await expect(presented(page, P01.slug)).toHaveCount(1);
  await expect(sheet.getByRole('link', { name: 'Comprar na Hotmart' })).toHaveAttribute('href', 'https://pay.hotmart.com/A108182228Y');
  for (const item of P01.includes) await expect(sheet).toContainText(item);
  expect(await page.locator('a[href*="espelho.lia.doctor"]').count()).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(roomUrl);
  await expect(sheet).toHaveCount(0);
  await expect(page.locator(`[data-volume="${P01.slug}"]`)).toBeFocused();
  await expect(presented(page, 'shelf')).toHaveCount(1);
  await page.goForward(); await expect(page).toHaveURL(`${roomUrl}/${P01.slug}`); await expect(sheet).toBeVisible();
  await page.reload(); await expect(page.getByRole('dialog', { name: P01.title })).toBeVisible();
  await expect(presented(page, P01.slug)).toHaveCount(1);
  await page.goBack(); await expect(page).toHaveURL(roomUrl);
  expect(errors).toEqual([]);
});

test('keyboard: Enter on a volume opens it with its own checkout, the close button returns focus', async ({ page }) => {
  await page.goto(roomUrl);
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-scene-ready', 'true');
  await page.locator(`[data-volume="${P02.slug}"]`).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${roomUrl}/${P02.slug}`);
  const sheet = page.getByRole('dialog', { name: P02.title });
  await expect(sheet.getByRole('link', { name: 'Comprar na Hotmart' })).toHaveAttribute('href', 'https://pay.hotmart.com/A108182278G');
  await expect(sheet).toContainText(P02.notice);
  await sheet.getByRole('button', { name: 'Fechar a ficha e devolver o livro à estante' }).click();
  await expect(page).toHaveURL(roomUrl);
  await expect(page.locator(`[data-volume="${P02.slug}"]`)).toBeFocused();
});

test('mobile: own sheet layout, book presented above it, no overflow, axe clean', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${roomUrl}/${P01.slug}`);
  const sheet = page.getByRole('dialog', { name: P01.title });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('link', { name: 'Comprar na Hotmart' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await sheet.boundingBox())!.y).toBeGreaterThan(250);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('fallback without WebGL and with reduced motion: deep link opens the sheet with the official banner', async ({ page }) => {
  await page.addInitScript(noWebgl);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${roomUrl}/${P01.slug}`);
  await expect(page.locator('.lia-experience')).toHaveAttribute('data-mode', 'html');
  const sheet = page.getByRole('dialog', { name: P01.title });
  await expect(sheet.getByRole('img', { name: `Banner oficial: ${P01.title}` })).toBeVisible();
  await sheet.getByRole('button', { name: 'Devolver à estante' }).click();
  await expect(page).toHaveURL(roomUrl);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('desktop sheet passes axe and unknown volumes 404', async ({ page, request }) => {
  await page.goto(`${roomUrl}/${P01.slug}`);
  await expect(page.getByRole('dialog', { name: P01.title })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect((await request.get(`${roomUrl}/nao-existe`)).status()).toBe(404);
  expect((await request.get(`/experiencia/corpo/${P01.slug}`)).status()).toBe(404);
});

test('public pages: every EspelhoMeu volume and Corpo Forte sell on Hotmart, never espelho.lia.doctor', async ({ request }) => {
  for (const path of ['/espelho-meu', ...espelhoOffers.map(offer => `/espelho-meu/${offer.slug}`)]) {
    const html = await (await request.get(path)).text();
    expect(html).not.toContain('espelho.lia.doctor');
  }
  for (const offer of espelhoOffers) {
    const html = await (await request.get(`/espelho-meu/${offer.slug}`)).text();
    expect(html).toContain(`href="https://pay.hotmart.com/${checkouts[offer.productCode]}"`);
    expect(html).toContain(`/experiencia/espelho-meu/${offer.slug}`);
  }
  expect(await (await request.get('/me-sentir-leve/corpo-forte')).text()).toContain('href="https://pay.hotmart.com/K108189729W"');
  expect(await (await request.get('/me-sentir-leve/tomei-mounjaro-e-agora')).text()).toContain('S108189606N');
});

test('cinematic entry preview: Skip lands on the CTA, reduced motion shows the arrival at once, noindex', async ({ page, browser }) => {
  await page.goto('/entrada');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('button', { name: 'Saltar introdução' }).click();
  const cta = page.getByRole('link', { name: 'Entrar no átrio' });
  await expect(cta).toBeFocused();
  await expect(cta).toHaveAttribute('href', '/experiencia');
  await expect(page.getByRole('button', { name: 'Saltar introdução' })).toHaveCount(0);
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const still = await reduced.newPage();
  await still.goto(new URL('/entrada', page.url()).toString());
  await expect(still.getByRole('link', { name: 'Entrar no átrio' })).toBeVisible();
  await expect(still.getByRole('button', { name: 'Saltar introdução' })).toHaveCount(0);
  expect((await new AxeBuilder({ page: still }).analyze()).violations).toEqual([]);
  await reduced.close();
  await cta.click();
  await expect(page).toHaveURL('/experiencia');
});

test('official social channels and WhatsApp with self-hosted brand marks', async ({ page, request }) => {
  const channels = { Facebook: 'https://web.facebook.com/lia.levelab', YouTube: 'https://www.youtube.com/@LIA.Doctor', TikTok: 'https://tiktok.com/@lia.doctor', Instagram: 'https://www.instagram.com/lia.levelab', 'Grupo WhatsApp': 'https://chat.whatsapp.com/FHzvr72KCiYCzlQ7klCTN3', 'WhatsApp da LIA': 'https://wa.me/5515981383291' };
  for (const path of ['/', '/experiencia']) {
    await page.goto(path);
    const nav = page.getByRole('navigation', { name: 'Canais oficiais da LIA' }).first();
    for (const [label, href] of Object.entries(channels)) await expect(nav.getByRole('link', { name: label })).toHaveAttribute('href', href);
    for (const src of await nav.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src')))) expect(src).toMatch(/^\/brands\/[a-z]+\.svg$/);
  }
  for (const brand of ['facebook', 'youtube', 'tiktok', 'instagram', 'whatsapp']) expect((await request.get(`/brands/${brand}.svg`)).status()).toBe(200);
});

test('buy buttons stay visible after load on every product page (no third-party script removes them)', async ({ page }) => {
  const pages = [...espelhoOffers.map(offer => [`/espelho-meu/${offer.slug}`, `https://pay.hotmart.com/${checkouts[offer.productCode]}`]), ['/me-sentir-leve/corpo-forte', 'https://pay.hotmart.com/K108189729W'], ['/me-sentir-leve/tomei-mounjaro-e-agora', 'https://pay.hotmart.com/S108189606N']];
  for (const [path, href] of pages) {
    await page.goto(path); await page.waitForTimeout(1500);
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
  }
});

test('no horizontal overflow on commercial pages at 360 and 390', async ({ page }) => {
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/espelho-meu', `/espelho-meu/${P01.slug}`, '/me-sentir-leve', '/me-sentir-leve/corpo-forte', '/me-sentir-leve/tomei-mounjaro-e-agora', '/privacidade']) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} @${width}`).toBe(true);
    }
  }
});
