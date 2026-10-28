// V1.2 evidence: entry frames, library selection (list and 3D click), sheets, fallback, public pages, videos.
// Usage: node scripts/livraria-evidence.mjs <baseURL> <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const [base = 'http://127.0.0.1:3107', out = 'docs/immersive/evidence/v12'] = process.argv.slice(2);
fs.mkdirSync(`${out}/video`, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const notes = [];
async function open(viewport, { video = false, reduced = false, noWebgl = false } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: reduced ? 'reduce' : 'no-preference', ...(video ? { recordVideo: { dir: `${out}/video`, size: viewport } } : {}) });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  if (noWebgl) await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); }; });
  return { context, page, errors };
}
const settle = (page, state) => page.locator(`.lia-canvas canvas[data-book-state="${state}"]`).waitFor({ timeout: 60000 });
async function finish({ context, page, errors }, label, rename) {
  const video = page.video();
  await context.close();
  if (video && rename) fs.renameSync(await video.path(), `${out}/video/${rename}`);
  notes.push(`${label}: ${errors.length ? errors.join(' | ') : 'no page/console errors'}`);
}

for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  // Entry: frames along the sequence, recorded.
  const entry = await open(viewport, { video: true });
  await entry.page.goto(`${base}/entrada`, { waitUntil: 'domcontentloaded' });
  for (const [i, wait] of [[1, 400], [2, 1500], [3, 1800], [4, 3500]]) { await entry.page.waitForTimeout(wait); await entry.page.screenshot({ path: `${out}/entry-${name}-${i}.png` }); }
  await finish(entry, `entry ${name}`, `entry-${name}.webm`);

  // Library: arrive, hover, select from the list, return; recorded.
  const lib = await open(viewport, { video: true });
  await lib.page.goto(`${base}/experiencia/espelho-meu`);
  await lib.page.locator('.lia-experience[data-scene-ready="true"]').waitFor();
  await lib.page.waitForTimeout(1200);
  await lib.page.screenshot({ path: `${out}/library-${name}-shelf.png`, fullPage: name === 'mobile' });
  if (name === 'desktop') {
    await lib.page.locator('[data-volume="21-dias-meu-melhor-reflexo"]').hover();
    await lib.page.waitForTimeout(900);
    await lib.page.screenshot({ path: `${out}/library-desktop-hover-p03.png` });
  }
  await lib.page.locator('[data-volume="7-dias-para-me-escolher"]').click();
  await settle(lib.page, '7-dias-para-me-escolher');
  await lib.page.waitForTimeout(900);
  await lib.page.screenshot({ path: `${out}/library-${name}-p01-sheet.png`, fullPage: name === 'mobile' });
  await lib.page.getByRole('button', { name: 'Devolver à estante' }).click();
  await settle(lib.page, 'shelf');
  await lib.page.waitForTimeout(600);
  await finish(lib, `library ${name}`, `library-${name}.webm`);
}

{ // 3D pointer path: click the P01 spine on the shelf itself.
  const run = await open({ width: 1440, height: 900 });
  await run.page.goto(`${base}/experiencia/espelho-meu`);
  await run.page.locator('.lia-experience[data-scene-ready="true"]').waitFor();
  await run.page.waitForTimeout(1200);
  let hit = null;
  for (let x = 690; x <= 760 && !hit; x += 4) {
    await run.page.mouse.move(x, 450); await run.page.waitForTimeout(150);
    const focused = await run.page.locator('.lia-library-list a.is-focused').getAttribute('data-volume').catch(() => null);
    if (focused) hit = { x, focused };
  }
  if (hit) {
    await run.page.screenshot({ path: `${out}/library-desktop-3d-hover.png` });
    await run.page.mouse.click(hit.x, 450);
    await run.page.waitForURL(`**/espelho-meu/${hit.focused}`);
    await settle(run.page, hit.focused);
    await run.page.screenshot({ path: `${out}/library-desktop-3d-click.png` });
  }
  notes.push(`3D pointer: ${hit ? `hover at x=${hit.x} highlighted ${hit.focused}; click opened /experiencia/espelho-meu/${hit.focused}` : 'no spine found on the sampled line'}`);
  await finish(run, '3d pointer');
}
{ // Pending volume, fallback, public page.
  const run = await open({ width: 1440, height: 900 });
  await run.page.goto(`${base}/experiencia/espelho-meu/eu-sou-bela-do-meu-jeito`);
  await settle(run.page, 'eu-sou-bela-do-meu-jeito'); await run.page.waitForTimeout(900);
  await run.page.screenshot({ path: `${out}/library-desktop-p02-pending.png` });
  await run.page.goto(`${base}/espelho-meu/7-dias-para-me-escolher`); await run.page.screenshot({ path: `${out}/public-p01-page.png`, fullPage: true });
  await finish(run, 'pending + public');
  const fallback = await open({ width: 1440, height: 900 }, { reduced: true, noWebgl: true });
  await fallback.page.goto(`${base}/experiencia/espelho-meu/7-dias-para-me-escolher`);
  await fallback.page.getByRole('dialog').waitFor();
  await fallback.page.screenshot({ path: `${out}/library-fallback-p01.png` });
  await finish(fallback, 'fallback');
}
await browser.close();
fs.writeFileSync(`${out}/evidence-run.txt`, notes.join('\n') + '\n');
console.log(notes.join('\n'));
