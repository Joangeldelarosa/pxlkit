import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareSemver, shouldNotify } from '../check-updates.mjs';

test('compares semver numerically, not as strings', () => {
  assert.equal(compareSemver('2.10.0', '2.9.0'), 1);
  assert.equal(compareSemver('2.9.0', '2.10.0'), -1);
  assert.equal(compareSemver('2.1.1', '2.1.1'), 0);
});

test('notifies only when the available version is greater', () => {
  assert.equal(shouldNotify('2.1.1', '2.2.0'), true);
  assert.equal(shouldNotify('2.1.1', '2.1.1'), false);
  assert.equal(shouldNotify('2.2.0', '2.1.1'), false);
});

test('never notifies on a malformed remote version', () => {
  // A corrupt response or an HTML error page must not read as "update available".
  assert.equal(shouldNotify('2.1.1', 'latest'), false);
  assert.equal(shouldNotify('2.1.1', ''), false);
  assert.equal(shouldNotify('2.1.1', null), false);
  assert.equal(shouldNotify('2.1.1', undefined), false);
  assert.equal(shouldNotify('2.1.1', '<!DOCTYPE html>'), false);
});

test('never notifies when the local version is unreadable', () => {
  assert.equal(shouldNotify(null, '3.0.0'), false);
  assert.equal(shouldNotify('unknown', '3.0.0'), false);
});

test('tolerates a v prefix on either side', () => {
  assert.equal(shouldNotify('v2.1.1', 'v2.2.0'), true);
  assert.equal(compareSemver('v3.0.0', '3.0.0'), 0);
});

test('a major bump notifies', () => {
  assert.equal(shouldNotify('2.1.1', '3.0.0'), true);
});

test('a patch bump notifies', () => {
  assert.equal(shouldNotify('2.1.1', '2.1.2'), true);
});

test('reads this plugin version, not whichever plugin owns the environment', async () => {
  // Regression. CLAUDE_PLUGIN_ROOT describes the plugin owning the current execution
  // context, which is not necessarily this one. Trusting it blindly once made the
  // script report a different plugin's 1.0.169 as "current" and announce an update
  // to pxlkit's 2.1.1 — a wrong number compared against an unrelated release line.
  const { execFileSync } = await import('node:child_process');
  const path = await import('node:path');
  const url = await import('node:url');
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const script = path.join(here, '..', 'check-updates.mjs');
  const manifest = JSON.parse(
    (await import('node:fs')).readFileSync(path.join(here, '..', '..', '.claude-plugin', 'plugin.json'), 'utf8'),
  );

  const out = execFileSync(process.execPath, [script, '--json'], {
    env: {
      ...process.env,
      // Point it somewhere real but belonging to a different plugin.
      CLAUDE_PLUGIN_ROOT: path.join(here, '..', '..', '..', '..'),
      PXLKIT_VERSION_URL: 'http://127.0.0.1:1/never',
    },
    encoding: 'utf8',
  });

  const parsed = JSON.parse(out);
  assert.equal(parsed.current, manifest.version);
});
