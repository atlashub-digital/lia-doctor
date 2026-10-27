import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts', fullyParallel: false, workers: 1,
  webServer: process.env.TEST_BASE_URL ? undefined : { command: 'npm run start -- --hostname 127.0.0.1 --port 3107', url: 'http://127.0.0.1:3107/experiencia', reuseExistingServer: !process.env.CI, timeout: 60_000 },
  timeout: 150_000, expect: { timeout: 15_000 }, reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3107', channel: process.env.CI ? undefined : 'chrome', headless: true, viewport: { width: 1440, height: 900 }, video: 'on', trace: 'retain-on-failure', launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
});
