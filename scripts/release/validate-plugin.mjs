#!/usr/bin/env node
/**
 * Validates the Claude Code plugin and marketplace manifests.
 *
 * The `claude` CLI has a `plugin validate` command, but it is not available on a CI
 * runner, and a manifest that is only ever checked on a maintainer's laptop is one
 * that will eventually ship broken — a malformed marketplace entry does not fail
 * anything locally, it just makes `claude plugin install` fail for everyone else.
 *
 * This checks the same structural invariants without needing the CLI. Coherence gate
 * 36 covers version coherence; this covers shape.
 *
 * Usage: node scripts/release/validate-plugin.mjs
 * Exit 0 when valid, 1 when not.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PLUGIN_JSON = 'plugins/pxlkit/.claude-plugin/plugin.json';
const MARKETPLACE_JSON = '.claude-plugin/marketplace.json';

const errors = [];
const notes = [];

function readJson(relative) {
  const file = path.join(repoRoot, relative);
  if (!fs.existsSync(file)) {
    errors.push(`${relative}: missing`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    errors.push(`${relative}: not valid JSON — ${err.message}`);
    return null;
  }
}

const SEMVER = /^\d+\.\d+\.\d+$/;

// --- plugin.json -----------------------------------------------------------

const plugin = readJson(PLUGIN_JSON);
if (plugin) {
  if (plugin.name !== 'pxlkit') {
    errors.push(`${PLUGIN_JSON}: name must be "pxlkit" (got ${JSON.stringify(plugin.name)})`);
  }
  if (!SEMVER.test(plugin.version ?? '')) {
    errors.push(`${PLUGIN_JSON}: version must be X.Y.Z (got ${JSON.stringify(plugin.version)})`);
  }
  if (typeof plugin.description !== 'string' || plugin.description.length === 0) {
    errors.push(`${PLUGIN_JSON}: description is required`);
  }
  notes.push(`plugin ${plugin.name}@${plugin.version}`);
}

// --- marketplace.json ------------------------------------------------------

const marketplace = readJson(MARKETPLACE_JSON);
if (marketplace) {
  // The marketplace name is what makes `claude plugin install pxlkit@pxlkit` resolve.
  if (marketplace.name !== 'pxlkit') {
    errors.push(
      `${MARKETPLACE_JSON}: name must be "pxlkit" — it is the second half of "pxlkit@pxlkit" (got ${JSON.stringify(marketplace.name)})`,
    );
  }
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    errors.push(`${MARKETPLACE_JSON}: plugins[] must list at least one plugin`);
  } else {
    const entry = marketplace.plugins.find((p) => p?.name === 'pxlkit');
    if (!entry) {
      errors.push(`${MARKETPLACE_JSON}: no plugins[] entry named "pxlkit"`);
    } else {
      if (!SEMVER.test(entry.version ?? '')) {
        errors.push(`${MARKETPLACE_JSON}: entry version must be X.Y.Z (got ${JSON.stringify(entry.version)})`);
      }
      if (typeof entry.source !== 'string') {
        errors.push(`${MARKETPLACE_JSON}: entry source must be a string path`);
      } else {
        const sourceDir = path.join(repoRoot, entry.source);
        if (!fs.existsSync(path.join(sourceDir, '.claude-plugin', 'plugin.json'))) {
          errors.push(
            `${MARKETPLACE_JSON}: source "${entry.source}" does not contain .claude-plugin/plugin.json`,
          );
        }
      }
    }
  }
}

// --- skills ----------------------------------------------------------------

const skillsDir = path.join(repoRoot, 'plugins/pxlkit/skills');
if (!fs.existsSync(skillsDir)) {
  errors.push('plugins/pxlkit/skills: missing');
} else {
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  if (skills.length === 0) errors.push('plugins/pxlkit/skills: no skills found');

  for (const skill of skills) {
    const file = path.join(skillsDir, skill.name, 'SKILL.md');
    if (!fs.existsSync(file)) {
      errors.push(`skills/${skill.name}: no SKILL.md`);
      continue;
    }
    const text = fs.readFileSync(file, 'utf8');
    const front = /^---\n([\s\S]*?)\n---/.exec(text);
    if (!front) {
      errors.push(`skills/${skill.name}/SKILL.md: missing YAML frontmatter`);
      continue;
    }
    const name = /^name:\s*(.+)$/m.exec(front[1])?.[1]?.trim();
    const description = /^description:\s*(.+)$/m.exec(front[1])?.[1]?.trim();

    if (name !== skill.name) {
      errors.push(`skills/${skill.name}/SKILL.md: frontmatter name is "${name}", expected "${skill.name}"`);
    }
    if (!description) {
      errors.push(`skills/${skill.name}/SKILL.md: description is required — it is the only text the model always sees`);
    }
  }

  // The description is paid for in every message of every session, so it is worth
  // failing on rather than discovering later in `claude plugin details`.
  const totalDescriptionChars = skills.reduce((sum, skill) => {
    const file = path.join(skillsDir, skill.name, 'SKILL.md');
    if (!fs.existsSync(file)) return sum;
    const match = /^description:\s*(.+)$/m.exec(fs.readFileSync(file, 'utf8'));
    return sum + (match?.[1]?.length ?? 0);
  }, 0);
  const approxTokens = Math.ceil(totalDescriptionChars / 4);
  notes.push(`${skills.length} skills · ~${approxTokens} always-on description tokens`);
  if (approxTokens > 400) {
    errors.push(
      `skill descriptions total ~${approxTokens} tokens, over the 400 budget. That cost is paid in every message of every session — shorten them.`,
    );
  }
}

// --- referenced scripts exist ----------------------------------------------

const scriptsDir = path.join(repoRoot, 'plugins/pxlkit/scripts');
const referenced = new Set();
if (fs.existsSync(skillsDir)) {
  for (const skill of fs.readdirSync(skillsDir)) {
    const file = path.join(skillsDir, skill, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/([\w.-]+)/g)) {
      referenced.add(m[1]);
    }
  }
}
for (const script of referenced) {
  if (!fs.existsSync(path.join(scriptsDir, script))) {
    errors.push(`a SKILL.md references scripts/${script}, which does not exist`);
  }
}
if (referenced.size > 0) notes.push(`${referenced.size} referenced scripts resolve`);

// --- report ----------------------------------------------------------------

if (errors.length === 0) {
  console.log('validate-plugin: OK');
  for (const note of notes) console.log(`  · ${note}`);
  process.exit(0);
}

console.error('validate-plugin: FAILED');
for (const error of errors) console.error(`  ✗ ${error}`);
process.exit(1);
