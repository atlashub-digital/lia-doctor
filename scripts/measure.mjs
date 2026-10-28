import { chromium, firefox, webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3107';
await mkdir('test-results', { recursive: true });
const report = { base, collectedAt: new Date().toISOString(), conditions: 'Windows; local production build; Chrome headless with software WebGL. Lab samples, not field Core Web Vitals.', metrics: [], browsers: [] };
for (const mobile of [false, true]) {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage(); const cdp = await context.newCDPSession(page);
  if (mobile) { await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 80, downloadThroughput: 1_000_000, uploadThroughput: 250_000 }); }
  await page.addInitScript(() => {
    window.__lab = { lcpMs: null, cls: 0, maxInteractionDurationMs: null };
    new PerformanceObserver(list => { for (const entry of list.getEntries()) { window.__lab.lcpMs = entry.startTime; window.__lab.lcpUrl = entry.url; window.__lab.lcpTag = entry.element?.tagName; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__lab.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (entry.interactionId) window.__lab.maxInteractionDurationMs = Math.max(window.__lab.maxInteractionDurationMs || 0, entry.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  await page.goto(`${base}/experiencia`, { waitUntil: 'networkidle', timeout: 90_000 }); await page.waitForTimeout(1500);
  if (mobile) await page.getByRole('button', { name: 'Olá, sou a LIA. Conversamos? ↗' }).click(); else await page.getByRole('button', { name: 'Sobre a LIA', exact: true }).first().click();
  await page.waitForTimeout(400); await page.keyboard.press('Escape');
  const sample = await page.evaluate(() => ({ ...window.__lab, transferredBytes: performance.getEntriesByType('resource').reduce((total, resource) => total + (resource.transferSize || 0), 0), slowResources: performance.getEntriesByType('resource').filter(resource => resource.duration > 1000).map(resource => ({ name: resource.name, duration: resource.duration, responseEnd: resource.responseEnd })), mode: document.querySelector('.lia-experience')?.getAttribute('data-mode') }));
  report.metrics.push({ viewport: mobile ? '390x844' : '1440x900', cpuThrottle: mobile ? 4 : 1, network: mobile ? '8Mbps down / 2Mbps up / 80ms RTT' : 'local unthrottled', ...sample, inpNote: 'maxInteractionDurationMs is a diagnostic event sample, not a validated INP percentile; null means no qualifying event timing entry.' });
  await browser.close();
}
for (const [name, engine] of (process.env.LAB_ONLY ? [] : [['Firefox', firefox], ['WebKit', webkit]])) {
  let browser;
  try {
    browser = await engine.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/experiencia`, { timeout: 60_000 });
    await page.locator('.lia-mobile-door').filter({ hasText: 'Corpo' }).click(); await page.waitForURL('**/experiencia/corpo');
    await page.reload(); await page.getByRole('heading', { name: 'Corpo', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Conversar com a LIA', exact: true }).click(); await page.getByRole('dialog').waitFor(); await page.keyboard.press('Escape');
    report.browsers.push({ name, version: browser.version(), status: 'pass: mobile room, direct refresh, chat modal, Escape', mode: await page.locator('.lia-experience').getAttribute('data-mode'), errors });
    await page.screenshot({ path: `test-results/${name.toLowerCase()}-mobile.png` });
  } catch (error) { report.browsers.push({ name, status: 'failed', error: String(error) }); }
  finally { await browser?.close(); }
}
await writeFile('test-results/measurements.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
