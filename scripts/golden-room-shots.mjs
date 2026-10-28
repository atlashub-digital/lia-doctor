// V1.1 Golden Room evidence: arrival frames, focus state, fallback and mobile. Usage: node scripts/golden-room-shots.mjs <baseURL> <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const [base = 'http://127.0.0.1:3107', out = 'docs/immersive/evidence/v11'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
async function open(viewport, options = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: options.reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  if (options.noWebgl) await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); }; });
  return { context, page };
}

{ // Desktop: real door journey from the lobby, then the focus signature move.
  const { context, page } = await open({ width: 1440, height: 900 });
  await page.goto(`${base}/experiencia`);
  await page.locator('.lia-experience[data-scene-ready="true"]').waitFor();
  await page.getByRole('link', { name: 'Entrar em EspelhoMeu', exact: true }).click();
  await page.waitForURL('**/experiencia/espelho-meu');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/espelho-desktop-1440-arrival.png` });
  await page.getByRole('link', { name: /21 Dias/ }).hover();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/espelho-desktop-1440-focus-p03.png` });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/espelho-desktop-1440-keyboard-p04.png` });
  await context.close();
}
for (const viewport of [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }]) {
  const { context, page } = await open(viewport);
  await page.goto(`${base}/experiencia/espelho-meu`);
  await page.locator('.lia-experience[data-scene-ready="true"]').waitFor();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/espelho-desktop-${viewport.width}.png` });
  await context.close();
}
for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 640 }]) {
  const { context, page } = await open(viewport);
  await page.goto(`${base}/experiencia/espelho-meu`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/espelho-mobile-${viewport.width}.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) errors.push(`horizontal overflow at ${viewport.width}px`);
  await context.close();
}
{
  const { context, page } = await open({ width: 1440, height: 900 }, { reduced: true, noWebgl: true });
  await page.goto(`${base}/experiencia/espelho-meu`);
  await page.locator('.lia-room-fallback').waitFor();
  await page.screenshot({ path: `${out}/espelho-fallback-reduced.png` });
  await context.close();
}
await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page/console errors');
