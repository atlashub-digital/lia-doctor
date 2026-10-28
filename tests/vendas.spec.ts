import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { products } from '../lib/products';

test('every work has a sales page with its own checkout, share card and no site navigation', async ({ page }) => {
  expect(products).toHaveLength(7);
  for (const product of products) {
    await page.goto(`/livros/${product.slug}`);
    await expect(page.getByRole('heading', { level: 1, name: product.title })).toBeVisible();
    await expect(page.locator('[data-checkout="hero"]')).toHaveAttribute('href', product.checkout);
    expect(await page.locator(`a[href^="${product.checkout}"]`).count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://www.lia.doctor${product.og}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.lia.doctor/livros/${product.slug}`);
    await expect(page.locator('.site-header')).toBeHidden();
    await expect(page.locator('.sp-notice')).toContainText(product.notice.slice(0, 40));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('campaign parameters are forwarded to the Hotmart checkout, and only the allowlist', async ({ page }) => {
  const product = products[0];
  await page.goto(`/livros/${product.slug}?utm_source=meta&utm_medium=paid&utm_campaign=p01-lancamento&src=fb-ads&email=x@y.z`);
  for (const placement of ['hero', 'middle', 'final', 'banner']) {
    const href = await page.locator(`[data-checkout="${placement}"]`).getAttribute('href');
    const url = new URL(href!);
    expect(`${url.origin}${url.pathname}`).toBe(product.checkout);
    expect(url.searchParams.get('utm_campaign')).toBe('p01-lancamento');
    expect(url.searchParams.get('src')).toBe('fb-ads');
    expect(url.searchParams.has('email')).toBe(false);
  }
});

test('mobile: sticky buy bar appears after the hero CTA, page passes axe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/livros/corpo-forte-alem-da-balanca');
  await expect(page.locator('.sp-sticky')).not.toHaveClass(/is-visible/);
  await page.evaluate(() => window.scrollTo(0, 1800));
  await expect(page.locator('.sp-sticky')).toHaveClass(/is-visible/);
  await expect(page.locator('.sp-sticky a')).toHaveAttribute('href', 'https://pay.hotmart.com/K108189729W');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('sales pages are in the sitemap and unknown slugs 404', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const product of products) expect(sitemap).toContain(`https://www.lia.doctor/livros/${product.slug}`);
  expect((await request.get('/livros/nao-existe')).status()).toBe(404);
});
