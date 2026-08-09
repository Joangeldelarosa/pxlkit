#!/usr/bin/env node
/**
 * Project preflight for the pxlkit skills.
 *
 * Answers one question before any skill writes code: can this project run
 * @pxlkit/ui-kit at all, and if so what is still missing?
 *
 * Exit codes are the contract:
 *   0  ready — the kit is installed and wired up
 *   1  repairable — compatible, but setup steps are missing
 *   2  incompatible — stop, and say why
 *
 * The distinction between 1 and 2 matters. Installing a missing provider is a
 * two-line edit a skill can offer to make. Migrating Tailwind v3 to v4 can break
 * every existing style in the project, so it is never done inline — it is reported
 * as a blocker with an explanation, and the user decides.
 *
 * Usage:
 *   node preflight.mjs [--json] [projectDir]
 */

import fs from 'node:fs';
import path from 'node:path';

/** Lowest React the kit's peerDependencies accept: ^18.2.0 || ^19.0.0. */
const REACT_MIN_MAJOR = 18;
const REACT_MIN_MINOR_ON_18 = 2;
/** Tailwind v4 is required: styles.css is `@import "tailwindcss"` + `@theme`. */
const TAILWIND_MIN_MAJOR = 4;

/**
 * Extracts {major, minor} from an npm range such as `^18.2.0`, `~4.0.0-beta.1`,
 * `>=19`, or `19.x`. Returns null for ranges with no readable floor (`*`, `latest`,
 * a git URL, `workspace:*`), which callers treat as "cannot verify" rather than
 * "too old" — refusing to run because a version string was exotic would be worse
 * than proceeding.
 */
export function parseVersionFloor(range) {
  if (typeof range !== 'string') return null;
  const match = /(\d+)(?:\.(\d+|x|\*))?/.exec(range);
  if (!match) return null;
  const major = Number.parseInt(match[1], 10);
  if (Number.isNaN(major)) return null;
  const rawMinor = match[2];
  const minor = rawMinor === undefined || rawMinor === 'x' || rawMinor === '*'
    ? 0
    : Number.parseInt(rawMinor, 10);
  return { major, minor: Number.isNaN(minor) ? 0 : minor };
}

/**
 * Classifies a project from its package.json alone.
 *
 * Kept pure and separate from disk access so the decision table is testable
 * without fixtures on disk.
 */
export function classifyProject(pkgJson) {
  const deps = {
    ...(pkgJson?.dependencies ?? {}),
    ...(pkgJson?.devDependencies ?? {}),
    ...(pkgJson?.peerDependencies ?? {}),
  };

  const blockers = [];
  const missing = [];

  // --- React ---
  const reactRange = deps.react;
  if (!reactRange) {
    blockers.push(
      'react is not a dependency. @pxlkit/ui-kit is a React component library ' +
        '(peer: react ^18.2.0 || ^19.0.0); it cannot be used in a non-React project.',
    );
  } else {
    const react = parseVersionFloor(reactRange);
    if (react) {
      const tooOld =
        react.major < REACT_MIN_MAJOR ||
        (react.major === REACT_MIN_MAJOR && react.minor < REACT_MIN_MINOR_ON_18);
      if (tooOld) {
        blockers.push(
          `react ${reactRange} is below the supported floor. @pxlkit/ui-kit requires ` +
            'react ^18.2.0 || ^19.0.0. Upgrade React before adding the kit.',
        );
      }
    }
  }

  // --- Tailwind ---
  const tailwindRange = deps.tailwindcss;
  if (!tailwindRange) {
    blockers.push(
      'tailwindcss is not a dependency. The kit\'s styles.css is not self-contained — ' +
        'it starts with `@import "tailwindcss"` and defines an `@theme`, so it needs a ' +
        'Tailwind v4 pipeline to compile. Add Tailwind v4 first.',
    );
  } else {
    const tailwind = parseVersionFloor(tailwindRange);
    if (tailwind && tailwind.major < TAILWIND_MIN_MAJOR) {
      blockers.push(
        `tailwindcss ${tailwindRange} is v${tailwind.major}; the kit requires v4 (CSS-first @theme). ` +
          'Migrating v3 to v4 can change how every existing style in this project compiles, ' +
          'so it is not something to do as a side effect of adding a component library. ' +
          'Plan that migration separately, then come back.',
      );
    }
  }

  // --- The kit itself ---
  if (!deps['@pxlkit/ui-kit']) {
    missing.push('@pxlkit/ui-kit is not installed — run: npm install @pxlkit/ui-kit');
  }

  const exitCode = blockers.length > 0 ? 2 : missing.length > 0 ? 1 : 0;
  return { exitCode, blockers, missing, uiKitRange: deps['@pxlkit/ui-kit'] ?? null };
}

/** Detects the package manager from lockfiles, which decides the Tailwind `@source` path. */
export function detectPackageManager(dir) {
  if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(dir, '.pnp.cjs')) || fs.existsSync(path.join(dir, '.pnp.js'))) return 'yarn-pnp';
  if (fs.existsSync(path.join(dir, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(dir, 'bun.lockb'))) return 'bun';
  return 'npm';
}

/** Detects the framework, which decides where providers go and whether 'use client' applies. */
export function detectFramework(dir) {
  const has = (p) => fs.existsSync(path.join(dir, p));
  if (has('app') || has('src/app')) return 'next-app-router';
  if (has('pages') || has('src/pages')) return 'next-pages-router';
  if (has('vite.config.ts') || has('vite.config.js') || has('vite.config.mts')) return 'vite';
  if (has('remix.config.js') || has('app/root.tsx')) return 'remix';
  return 'unknown';
}

/** Reads every source file once and reports which setup steps are already done. */
function detectSetup(dir) {
  const results = {
    stylesImport: false,
    surfaceProvider: false,
    toastProvider: false,
    localeProvider: false,
    fonts: false,
    tailwindSource: false,
  };

  const roots = ['src', 'app', 'pages', 'styles'].map((r) => path.join(dir, r)).filter(fs.existsSync);
  if (roots.length === 0) roots.push(dir);

  const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.mjs']);
  const walk = (current, depth) => {
    if (depth > 6) return;
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
        continue;
      }
      if (!exts.has(path.extname(entry.name))) continue;
      let text;
      try {
        text = fs.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      if (text.includes('@pxlkit/ui-kit/styles.css')) results.stylesImport = true;
      if (text.includes('PxlKitSurfaceProvider')) results.surfaceProvider = true;
      if (text.includes('PxlKitToastProvider')) results.toastProvider = true;
      if (text.includes('PxlKitLocaleProvider')) results.localeProvider = true;
      if (text.includes('buildGoogleFontsUrl') || text.includes('Press+Start+2P')) results.fonts = true;
      if (text.includes('@source') && text.includes('ui-kit')) results.tailwindSource = true;
    }
  };
  for (const root of roots) walk(root, 0);
  return results;
}

function readPackageJson(dir) {
  const file = path.join(dir, 'package.json');
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function main(argv) {
  const args = argv.slice(2);
  const asJson = args.includes('--json');
  const dir = path.resolve(args.find((a) => !a.startsWith('--')) ?? process.cwd());

  const pkgJson = readPackageJson(dir);
  if (!pkgJson) {
    const message = `No readable package.json in ${dir}. Run this from a JavaScript project root.`;
    if (asJson) console.log(JSON.stringify({ ok: false, exitCode: 2, blockers: [message] }, null, 2));
    else console.error(message);
    process.exit(2);
  }

  const verdict = classifyProject(pkgJson);
  const setup = verdict.exitCode === 2 ? null : detectSetup(dir);
  const missing = [...verdict.missing];

  if (setup) {
    if (!setup.stylesImport) {
      missing.push(
        "styles.css is not imported — without it the pixel surface silently degrades to plain boxes. " +
          "Add: import '@pxlkit/ui-kit/styles.css'",
      );
    }
    if (!setup.tailwindSource) {
      missing.push('Tailwind cannot see the kit\'s classes — add an `@source` directive pointing at @pxlkit/ui-kit.');
    }
    if (!setup.surfaceProvider) missing.push('PxlKitSurfaceProvider is not mounted (optional, but it is how surface is set globally).');
    if (!setup.toastProvider) missing.push('PxlKitToastProvider is not mounted — useToast() throws without it.');
    if (!setup.fonts) missing.push('The pixel fonts are not loaded — display type falls back to a system font.');
  }

  const report = {
    ok: verdict.exitCode === 0 && missing.length === 0,
    exitCode: verdict.blockers.length > 0 ? 2 : missing.length > 0 ? 1 : 0,
    dir,
    framework: detectFramework(dir),
    packageManager: detectPackageManager(dir),
    uiKitRange: verdict.uiKitRange,
    setup,
    missing,
    blockers: verdict.blockers,
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`pxlkit preflight — ${report.dir}`);
    console.log(`  framework:       ${report.framework}`);
    console.log(`  package manager: ${report.packageManager}`);
    console.log(`  @pxlkit/ui-kit:  ${report.uiKitRange ?? 'not installed'}`);
    if (report.blockers.length) {
      console.log('\nBLOCKERS — this project cannot use pxlkit as it stands:');
      for (const b of report.blockers) console.log(`  ✗ ${b}`);
    }
    if (report.missing.length) {
      console.log('\nMissing setup (repairable):');
      for (const m of report.missing) console.log(`  • ${m}`);
    }
    if (report.exitCode === 0) console.log('\n✓ Ready.');
  }

  process.exit(report.exitCode);
}

// Only run when invoked directly, so the pure functions stay importable from tests.
const invokedDirectly =
  process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href;
if (invokedDirectly) main(process.argv);
