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
 * Without --dry-run it runs `gh`, with GH_TOKEN when set: in the workflow, the
 * workflow's own token. GitHub lets that token tag the version just
 * published, at the tip of main, but may refuse it a tag on an older commit
 * (HTTP 403, "Resource not accessible by integration"): a new tag there can
 * count as a change to the workflow files, which takes the Workflows
 * permission no workflow token has. RELEASE_TOKEN, when set, is a token with
 * that permission, and creates the releases GitHub refused the first token.
 * Tags and releases made with the workflow's token start no other workflow;
 * ones made with RELEASE_TOKEN start the publish workflow of the tagged
 * commit, which publishes nothing that is already on npm.
 *
 * The run fails when the newest version is left without its release, or on an
 * error it does not expect. An older version left without one is a warning.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

/** Each tag's commit, from `git ls-remote --tags`: an annotated tag's peeled `^{}` line wins. */
export function tagCommits(lsRemote) {
  const commits = new Map();
  for (const line of lsRemote.split('\n').filter(Boolean)) {
    const [sha, ref] = line.split('\t');
    const peeled = ref.endsWith('^{}');
    const tag = ref.replace(/^refs\/tags\//, '').replace(/\^\{\}$/, '');
    if (peeled || !commits.has(tag)) commits.set(tag, sha);
  }
  return commits;
}

/** What `gh` said when it failed, on one line and without the API's URL. */
function reason(error) {
  return String(error?.stderr || error?.message || error)
    .replace(/\s*\(https:\/\/api\.github\.com\/[^)]*\)/g, '')
    .trim()
    .replace(/\s*\n\s*/g, ' ');
}

/** Whether GitHub refused the workflow's token the release's tag. */
export function refusedTag(error) {
  return /HTTP 403: Resource not accessible by integration/.test(reason(error));
}

/**
 * Creates a release with `run(env)`: as is, then — when GitHub refused that
 * token the tag and there is a release token — with GH_TOKEN set to it.
 */
export function createRelease(run, releaseToken) {
  try {
    run({});
    return { ok: true, fallback: false };
  } catch (error) {
    if (!refusedTag(error)) return { ok: false, refused: false, error };
    if (!releaseToken) return { ok: false, refused: true, error };
    try {
      run({ GH_TOKEN: releaseToken });
      return { ok: true, fallback: true };
    } catch (retryError) {
      return { ok: false, refused: false, error: retryError, withReleaseToken: true };
    }
  }
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

function gh(args, env = {}) {
  return execFileSync('gh', args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
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
  const tags = tagCommits(git('ls-remote', '--tags', 'origin'));
  const base = repoUrl();
  const releaseToken = process.env.RELEASE_TOKEN || '';
  const annotate = process.env.GITHUB_ACTIONS === 'true';
  const missing = [];
  let created = 0;

  /** A version left without its release: an error for the newest or an unexpected cause, else a warning. */
  const leave = (version, message, expected = true) => {
    const error = version === newest || !expected;
    if (error) process.exitCode = 1;
    missing.push(`v${version}`);
    const text = `v${version}: ${message}`;
    if (!annotate) console.log(`${error ? '✗' : '!'} ${text}`);
    else {
      const data = text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
      console.log(`::${error ? 'error' : 'warning'}::${data}`);
    }
  };

  for (const version of versions) {
    const tag = `v${version}`;
    const sha = kit.versions[version].gitHead;
    const tagged = tags.get(tag);
    const elsewhere = Boolean(tagged && sha && tagged !== sha);
    const on = elsewhere ? ` on ${tagged.slice(0, 7)} while npm published from ${sha.slice(0, 7)}` : '';
    if (!dryRun && releaseExists(tag)) {
      console.log(`= ${tag}: the release exists${elsewhere ? `, tagged${on}` : ''}`);
      continue;
    }
    if (dryRun && tagged) {
      console.log(`= ${tag}: the tag exists${elsewhere ? `,${on}` : ''}; the real run creates its release only if it has none`);
      continue;
    }
    if (!sha || !hasCommit(sha)) {
      leave(version, `npm records no commit for ${KIT}@${version}, or the repository lacks ${sha}`);
      continue;
    }
    if (elsewhere) {
      leave(
        version,
        `the tag ${tag} is on ${tagged.slice(0, 7)}, not on ${sha.slice(0, 7)} that npm published ${KIT}@${version} from`,
      );
      continue;
    }
    const section = rootReleaseSection(rootChangelog, version) ?? kitReleaseSection(kitChangelog, version);
    if (!section) {
      leave(version, `no changelog section for ${version}`);
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
    const dir = mkdtempSync(path.join(tmpdir(), 'release-'));
    const file = path.join(dir, 'notes.md');
    writeFileSync(file, notes);
    const where = tagged ? ['--verify-tag'] : ['--target', sha];
    const command = ['release', 'create', tag, ...where, '--title', title, '--notes-file', file, `--latest=${latest}`];
    const result = createRelease((env) => gh(command, env), releaseToken);
    rmSync(dir, { recursive: true, force: true });
    if (result.ok) {
      created++;
      if (result.fallback) console.log('  created with RELEASE_TOKEN: GitHub refused the workflow token the tag');
    } else if (result.refused) {
      leave(
        version,
        `GitHub refused the workflow token a tag on ${sha.slice(0, 7)}, an older commit ` +
          '(HTTP 403, "Resource not accessible by integration"). Add a RELEASE_TOKEN secret, a fine-grained ' +
          'token for this repository with Contents and Workflows: Read and write, and run this workflow again.',
      );
    } else if (result.withReleaseToken) {
      leave(
        version,
        `RELEASE_TOKEN was refused too (${reason(result.error)}). It needs Contents and Workflows: ` +
          'Read and write on this repository; replace it if it has expired.',
        false,
      );
    } else {
      leave(version, reason(result.error), false);
    }
  }
  const without = missing.length ? `; without a release: ${missing.join(', ')}` : '';
  console.log(dryRun ? `dry run: nothing created${without}` : `${created} release(s) created${without}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
