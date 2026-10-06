#!/usr/bin/env node
/**
 * Creates the GitHub Releases the repository is missing: one per version of
 * @pxlkit/ui-kit on npm, tagged `v<version>` on the commit npm published it
 * from (the version's `gitHead`). The notes are that release's section of the
 * root CHANGELOG.md — or, without one, of packages/ui-kit/CHANGELOG.md — after
 * a table of every package npm published from the same commit, and a link to
 * the changelog on main.
 *
 * Idempotent: a version whose release exists is left alone, and a tag that
 * exists without a release gets its release. Versions are created oldest
 * first, and only the newest is marked Latest.
 *
 *   node scripts/release/github-release.mjs [--dry-run] [--since <version>]
 *
 *   --dry-run          print what would be created; needs neither gh nor a token
 *   --since <version>  oldest version to consider (default 2.0.0, the first
 *                      version with a GitHub Release)
 *
 * Without --dry-run it runs `gh` with a token that may write contents
 * (GH_TOKEN). Tags and releases made with a workflow's own token start no
 * other workflow, so this never re-triggers the publish workflow.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REGISTRY = 'https://registry.npmjs.org';
const KIT = '@pxlkit/ui-kit';
/** GitHub's limit is 125,000 characters; leave room for the truncation note. */
const NOTES_LIMIT = 120_000;

/** `[major, minor, patch]` of a plain `x.y.z` version, or null (prereleases included). */
export function parseVersion(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return m ? m.slice(1).map(Number) : null;
}

export function compareVersions(a, b) {
  const [pa, pb] = [parseVersion(a), parseVersion(b)];
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

/** The package directories publish.yml publishes, in its order. */
export function publishedPackageDirs(workflow) {
  const list = /PACKAGES=\(([\s\S]*?)\)/.exec(workflow);
  if (!list) throw new Error('publish.yml: no PACKAGES=( … ) list');
  return [...list[1].matchAll(/["']([^"'\s]+)["']/g)].map((m) => m[1].replace(/\/+$/, ''));
}

/** `## …` sections of a changelog: their heading line and the text up to the next one. */
function sections(changelog) {
  const heads = [...changelog.matchAll(/^## (.*)$/gm)];
  return heads.map((m, i) => ({
    heading: m[1].trim(),
    body: changelog.slice(m.index + m[0].length, i + 1 < heads.length ? heads[i + 1].index : undefined).trim(),
  }));
}

/**
 * The root changelog's section for a kit version: its heading names the
 * release in brackets — `## [ui-kit 2.2.0 / core 1.4.0 / …] - 2026-10-06 — Title`.
 */
export function rootReleaseSection(changelog, version) {
  const name = new RegExp(`(^|[\\s/\\[])ui-kit ${version.replace(/\./g, '\\.')}(?=[\\s/\\]])`);
  for (const s of sections(changelog)) {
    const m = /^\[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?(?:\s*—\s*(.+))?$/.exec(s.heading);
    if (m && name.test(`[${m[1]}]`)) return { title: m[3]?.trim() ?? null, date: m[2] ?? null, body: s.body };
  }
  return null;
}

/** The kit changelog's section for a version: `## 2.0.1 — 2026-06-02` (title in parentheses, if any). */
export function kitReleaseSection(changelog, version) {
  for (const s of sections(changelog)) {
    const m = /^(\d+\.\d+\.\d+)\s*—\s*(\d{4}-\d{2}-\d{2})(?:\s*\((.+)\))?$/.exec(s.heading);
    if (m && m[1] === version) return { title: m[3]?.trim() ?? null, date: m[2], body: s.body };
  }
  return null;
}

/** The release's notes: the packages npm published from its commit, then its changelog section. */
export function releaseNotes({ packages, section, changelogUrl }) {
  const rows = packages.map(
    ({ name, version }) => `| [\`${name}\`](https://www.npmjs.com/package/${name}/v/${version}) | ${version} |`,
  );
  const head = ['### Packages', '', '| Package | Version |', '| --- | --- |', ...rows, '', ''].join('\n');
  const tail = `\n\nFull changelog: ${changelogUrl}\n`;
  let body = section;
  if (head.length + body.length + tail.length > NOTES_LIMIT) {
    body = `${body.slice(0, NOTES_LIMIT - head.length - tail.length - 80).replace(/\n[^\n]*$/, '')}\n\n…(continued in the changelog)`;
  }
  return head + body + tail;
}

async function packument(name) {
  const res = await fetch(`${REGISTRY}/${name.replace('/', '%2f')}`, { headers: { accept: 'application/json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${name}: registry answered ${res.status}`);
  return res.json();
}

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function hasCommit(sha) {
  try {
    git('cat-file', '-e', `${sha}^{commit}`);
    return true;
  } catch {
    return false;
  }
}

function remoteTags() {
  const out = git('ls-remote', '--tags', 'origin');
  return new Set(out.split('\n').filter(Boolean).map((line) => line.split('\t')[1].replace(/^refs\/tags\//, '').replace(/\^\{\}$/, '')));
}

function gh(args) {
  return execFileSync('gh', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function releaseExists(tag) {
  try {
    gh(['release', 'view', tag, '--json', 'tagName']);
    return true;
  } catch {
    return false;
  }
}

function repoUrl() {
  if (process.env.GITHUB_REPOSITORY) return `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const url = git('remote', 'get-url', 'origin').replace(/\.git$/, '');
  const m = /github\.com[/:]([^/]+\/[^/]+)$/.exec(url);
  return m ? `https://github.com/${m[1]}` : url;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const sinceIndex = args.indexOf('--since');
  const since = sinceIndex >= 0 ? args[sinceIndex + 1] ?? '' : '2.0.0';
  if (!parseVersion(since)) throw new Error(`--since: "${since}" is not a version`);

  const rootChangelog = readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  const kitChangelog = readFileSync(path.join(ROOT, 'packages/ui-kit/CHANGELOG.md'), 'utf8');
  const dirs = publishedPackageDirs(readFileSync(path.join(ROOT, '.github/workflows/publish.yml'), 'utf8'));
  const names = dirs.map((dir) => JSON.parse(readFileSync(path.join(ROOT, dir, 'package.json'), 'utf8')).name);
  const docs = new Map();
  for (const name of names) docs.set(name, await packument(name));
  const kit = docs.get(KIT);
  if (!kit) throw new Error(`${KIT} is not on npm`);

  const versions = Object.keys(kit.versions)
    .filter((v) => parseVersion(v) && compareVersions(v, since) >= 0)
    .sort(compareVersions);
  const newest = versions.at(-1);
  const tags = remoteTags();
  const base = repoUrl();
  let created = 0;

  for (const version of versions) {
    const tag = `v${version}`;
    const sha = kit.versions[version].gitHead;
    if (!dryRun && releaseExists(tag)) {
      console.log(`= ${tag}: the release exists`);
      continue;
    }
    if (dryRun && tags.has(tag)) {
      console.log(`= ${tag}: the tag exists (the real run creates its release only if it has none)`);
      continue;
    }
    if (!sha || !hasCommit(sha)) {
      console.warn(`! ${tag}: npm records no commit for ${KIT}@${version}, or the repository lacks ${sha}; skipped`);
      continue;
    }
    const section = rootReleaseSection(rootChangelog, version) ?? kitReleaseSection(kitChangelog, version);
    if (!section) {
      console.warn(`! ${tag}: no changelog section for ${version}; skipped`);
      continue;
    }
    const packages = [];
    for (const name of names) {
      const doc = docs.get(name);
      if (!doc) continue;
      for (const [v, meta] of Object.entries(doc.versions)) if (meta.gitHead === sha) packages.push({ name, version: v });
    }
    const title = section.title ? `${tag} — ${section.title}` : tag;
    const notes = releaseNotes({ packages, section: section.body, changelogUrl: `${base}/blob/main/CHANGELOG.md` });
    const latest = version === newest;
    console.log(
      `+ ${tag} on ${sha.slice(0, 7)}: "${title}", ${packages.length} package(s), ${notes.length} characters of notes${latest ? ', Latest' : ''}`,
    );
    if (dryRun) continue;
    const file = path.join(mkdtempSync(path.join(tmpdir(), 'release-')), 'notes.md');
    writeFileSync(file, notes);
    const where = tags.has(tag) ? ['--verify-tag'] : ['--target', sha];
    gh(['release', 'create', tag, ...where, '--title', title, '--notes-file', file, `--latest=${latest}`]);
    created++;
  }
  console.log(dryRun ? 'dry run: nothing created' : `${created} release(s) created`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
