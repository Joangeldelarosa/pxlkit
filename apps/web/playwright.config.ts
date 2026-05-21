/* ═══════════════════════════════════════════════════════════════
 *  Playwright config — visual debugging harness for /explore
 *
 *  Run:
 *    npm run test:visual          # headless, all scenarios
 *    npm run test:visual:headed   # see the browser
 *    npm run test:visual:ui       # Playwright's interactive UI
 *    npm run test:visual:update   # rewrite baseline screenshots
 *
 *  Scenarios live in tests/visual/scenarios/*.spec.ts and use the
 *  shared factory in tests/visual/_fixtures/world.ts.
 *
 *  CI integration is intentionally NOT wired here — GPU rendering
 *  drifts across machines so baselines stay local-only for now.
 * ═══════════════════════════════════════════════════════════════ */

import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const PORT = 3333;
const REPO_ROOT = path.resolve(__dirname, '..', '..');

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,    // GPU contention — serialize
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 180_000,
  expect: {
    toHaveScreenshot: {
      // 2% tolerance — accommodates noise + GPU non-determinism
      maxDiffPixelRatio: 0.02,
      threshold: 0.25,
      animations: 'disabled',
    },
  },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Hide cursor in screenshots
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    cwd: REPO_ROOT,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  outputDir: './test-results',
});
