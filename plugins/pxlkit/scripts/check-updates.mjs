#!/usr/bin/env node
/**
 * Update check for the pxlkit plugin.
 *
 * The plugin ships a digest of the kit's API frozen at build time. When the kit
 * moves on and the plugin does not, the skills keep answering confidently from a
 * stale map — a failure that is invisible from the inside. This makes it visible.
 *
 * Design constraints, in order of importance:
 *
 *   1. It must never break a skill. Every failure path — no network, DNS blocked,
 *      corporate proxy, malformed JSON, site down — exits 0 and prints nothing.
 *   2. It must not be chatty. One network request per 24h, cached in the OS temp dir.
 *   3. It must be opt-out-able and disclosed. PXLKIT_SKIP_UPDATE_CHECK=1 disables it,
 *      and every SKILL.md that calls it says so.
 *
 * Usage:
 *   node check-updates.mjs [--json]
 *
 * Prints one line when an update exists, nothing otherwise. Always exits 0.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE_FILE = path.join(os.tmpdir(), 'pxlkit-skill-update-check.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 2000;

const VERSION_URL = process.env.PXLKIT_VERSION_URL || 'https://pxlkit.xyz/skills/version.json';
const NPM_FALLBACK_URL = 'https://registry.npmjs.org/@pxlkit/ui-kit/latest';

/**
 * Compares two semver strings numerically.
 *
 * String comparison would rank '2.9.0' above '2.10.0', which is exactly the case
 * where a stale plugin most needs to notice it is behind.
 *
 * @returns -1 if a < b, 0 if equal, 1 if a > b. Returns 0 for unparseable input,
 *          so a malformed remote response can never trigger a notification.
 */
export function compareSemver(a, b) {
  const parse = (v) => {
    if (typeof v !== 'string') return null;
    const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v.trim());
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  };
  const pa = parse(a);
  const pb = parse(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

/** True only when `latest` is a well-formed version strictly greater than `current`. */
export function shouldNotify(current, latest) {
  if (typeof current !== 'string' || typeof latest !== 'string') return false;
  if (!/^v?\d+\.\d+\.\d+/.test(current.trim()) || !/^v?\d+\.\d+\.\d+/.test(latest.trim())) return false;
  return compareSemver(latest, current) > 0;
}

/**
 * Reads *this plugin's* version from its manifest.
 *
 * The name check is not paranoia. `CLAUDE_PLUGIN_ROOT` describes whichever plugin
 * owns the current execution context, which is not necessarily this one — running
 * this script while another plugin's environment is set reads that plugin's
 * manifest and compares a completely unrelated version number against pxlkit's
 * releases. Observed in practice: it reported context-mode's 1.0.169 as "current"
 * and cheerfully announced an update to 2.1.1.
 *
 * The path next to this script is the reliable answer, so it is tried first; the
 * environment variable is a fallback and is only trusted if the manifest it points
 * at actually says `pxlkit`.
 */
function readCurrentVersion() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [path.join(here, '..', '.claude-plugin', 'plugin.json')];
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    candidates.push(path.join(process.env.CLAUDE_PLUGIN_ROOT, '.claude-plugin', 'plugin.json'));
  }

  for (const file of candidates) {
    try {
      const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (manifest.name === 'pxlkit' && typeof manifest.version === 'string') {
        return manifest.version;
      }
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

function readCache() {
  try {
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (typeof cached.checkedAt !== 'number') return null;
    if (Date.now() - cached.checkedAt > CACHE_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ ...payload, checkedAt: Date.now() }), 'utf8');
  } catch {
    // A read-only or full temp dir just means we check again next time. Not an error.
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Resolves the latest published versions.
 *
 * The site is authoritative because it is the only source that knows the *plugin*
 * version, which can move independently of the kit. npm is the fallback and only
 * reports the kit, which still works as a lower bound since the two are released
 * together.
 */
async function fetchLatest() {
  const site = await fetchJson(VERSION_URL);
  if (site && (typeof site.plugin === 'string' || typeof site.uiKit === 'string')) {
    return { plugin: site.plugin ?? null, uiKit: site.uiKit ?? null, source: 'site' };
  }
  // npm deliberately does NOT fall back into `plugin`.
  //
  // The registry publishes @pxlkit/ui-kit, which since the plugin/kit version split
  // is a different line entirely. Treating it as the plugin's latest compares 1.0.0
  // against 2.1.1 and announces an update to a version that does not exist — to
  // every user, every day. The kit number is still worth having, so it is kept
  // under `uiKit` and left out of the plugin decision.
  const npm = await fetchJson(NPM_FALLBACK_URL);
  if (npm && typeof npm.version === 'string') {
    return { plugin: null, uiKit: npm.version, source: 'npm' };
  }
  return null;
}

async function main() {
  const asJson = process.argv.includes('--json');

  if (process.env.PXLKIT_SKIP_UPDATE_CHECK) {
    if (asJson) console.log(JSON.stringify({ skipped: true, reason: 'PXLKIT_SKIP_UPDATE_CHECK' }));
    return;
  }

  const current = readCurrentVersion();
  if (!current) {
    if (asJson) console.log(JSON.stringify({ skipped: true, reason: 'plugin version not readable' }));
    return;
  }

  let latest = readCache();
  let cached = true;
  if (!latest) {
    cached = false;
    latest = await fetchLatest();
    if (latest) writeCache(latest);
  }

  if (!latest) {
    if (asJson) console.log(JSON.stringify({ current, latest: null, updateAvailable: false, reason: 'offline' }));
    return;
  }

  // No `?? latest.uiKit` here. The kit version is not the plugin's, and falling back
  // to it is exactly how this reported an update to a version that does not exist.
  const latestPlugin = latest.plugin ?? null;
  const updateAvailable = shouldNotify(current, latestPlugin);

  if (asJson) {
    console.log(
      JSON.stringify({
        current,
        latest: latestPlugin,
        uiKit: latest.uiKit ?? null,
        updateAvailable,
        source: latest.source ?? 'cache',
        cached,
      }),
    );
    return;
  }

  if (updateAvailable) {
    console.log(
      `pxlkit plugin ${current} → ${latestPlugin} available. Update with: claude plugin update pxlkit`,
    );
  }
}

// Never let this script be the reason a skill fails.
main().catch(() => {}).finally(() => process.exit(0));
