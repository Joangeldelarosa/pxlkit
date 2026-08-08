#!/usr/bin/env node
/**
 * bump-plugin.mjs — sync the Claude Code plugin version with the kit release.
 *
 * Rewrites, in lockstep:
 *   - plugins/pxlkit/.claude-plugin/plugin.json  -> .version
 *   - .claude-plugin/marketplace.json            -> plugins[name === "pxlkit"].version
 *
 * Both files are rewritten with 2-space indentation and a trailing newline,
 * which is exactly how they are stored in the repo, so the diff is one line
 * per file and nothing else.
 *
 * Usage:
 *   node scripts/release/bump-plugin.mjs --version 2.2.0
 *   npm run release:bump-plugin -- --version 2.2.0
 *
 * Node ESM, zero dependencies.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PLUGIN_NAME = 'pxlkit';

/** Strict semver core: X.Y.Z, no leading zeros, no prerelease/build metadata. */
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..');

const PLUGIN_MANIFEST = path.join(
  REPO_ROOT,
  'plugins',
  PLUGIN_NAME,
  '.claude-plugin',
  'plugin.json',
);
const MARKETPLACE_MANIFEST = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');

class BumpError extends Error {}

/**
 * @param {string[]} argv raw args (process.argv.slice(2))
 * @returns {string} the validated version
 */
export function parseVersion(argv) {
  let raw = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--version') {
      raw = argv[i + 1] ?? null;
      i += 1;
    } else if (arg.startsWith('--version=')) {
      raw = arg.slice('--version='.length);
    } else {
      throw new BumpError(
        `Unknown argument "${arg}". Usage: node scripts/release/bump-plugin.mjs --version X.Y.Z`,
      );
    }
  }

  if (raw === null || raw === '') {
    throw new BumpError(
      'Missing --version. Usage: node scripts/release/bump-plugin.mjs --version X.Y.Z',
    );
  }

  const version = raw.startsWith('v') ? raw.slice(1) : raw;

  if (!SEMVER.test(version)) {
    throw new BumpError(
      `Invalid version "${raw}". Expected a strict semver core X.Y.Z ` +
        '(three numeric parts, no leading zeros, no prerelease or build metadata).',
    );
  }

  return version;
}

/**
 * @param {string} file absolute path
 * @returns {Promise<any>} parsed JSON
 */
async function readJson(file) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw new BumpError(`File not found: ${path.relative(REPO_ROOT, file)}`);
    }
    throw new BumpError(`Cannot read ${path.relative(REPO_ROOT, file)}: ${err.message}`);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new BumpError(`Invalid JSON in ${path.relative(REPO_ROOT, file)}: ${err.message}`);
  }
}

/**
 * @param {string} file absolute path
 * @param {any} data
 */
async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/**
 * @param {string} version validated semver
 * @returns {Promise<{file: string, from: string, to: string}[]>}
 */
export async function bumpPlugin(version) {
  const changes = [];

  const plugin = await readJson(PLUGIN_MANIFEST);
  if (typeof plugin.version !== 'string') {
    throw new BumpError(
      `plugins/${PLUGIN_NAME}/.claude-plugin/plugin.json has no string "version" field.`,
    );
  }
  const pluginFrom = plugin.version;
  plugin.version = version;

  const marketplace = await readJson(MARKETPLACE_MANIFEST);
  if (!Array.isArray(marketplace.plugins)) {
    throw new BumpError('.claude-plugin/marketplace.json has no "plugins" array.');
  }
  const entry = marketplace.plugins.find((p) => p && p.name === PLUGIN_NAME);
  if (!entry) {
    throw new BumpError(
      `.claude-plugin/marketplace.json has no plugin entry named "${PLUGIN_NAME}".`,
    );
  }
  if (typeof entry.version !== 'string') {
    throw new BumpError(
      `.claude-plugin/marketplace.json entry "${PLUGIN_NAME}" has no string "version" field.`,
    );
  }
  const marketplaceFrom = entry.version;
  entry.version = version;

  // Both manifests parsed and validated before anything is written, so a bad
  // marketplace.json cannot leave plugin.json bumped on its own.
  await writeJson(PLUGIN_MANIFEST, plugin);
  changes.push({
    file: path.relative(REPO_ROOT, PLUGIN_MANIFEST),
    from: pluginFrom,
    to: version,
  });

  await writeJson(MARKETPLACE_MANIFEST, marketplace);
  changes.push({
    file: path.relative(REPO_ROOT, MARKETPLACE_MANIFEST),
    from: marketplaceFrom,
    to: version,
  });

  return changes;
}

async function main() {
  const version = parseVersion(process.argv.slice(2));
  const changes = await bumpPlugin(version);
  for (const change of changes) {
    console.log(`${change.file}: ${change.from} -> ${change.to}`);
  }
  console.log(`Plugin version synced to ${version}.`);
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  try {
    await main();
  } catch (err) {
    if (err instanceof BumpError) {
      console.error(`bump-plugin: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}
