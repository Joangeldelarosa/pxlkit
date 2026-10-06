/**
 * Focus audit — does every focusable element of the React kit's examples
 * show keyboard focus?
 *
 * The audit mounts each example of every component manifest in Chromium, on
 * the pixel and the linear surface, in the dark and the light theme, and gives
 * each focusable element of the example keyboard focus, so `:focus-visible`
 * applies. It screenshots the region covering the element and every element
 * whose computed style changed — the indicator may be drawn on the element,
 * an ancestor (`has-*`), a sibling (`peer-*`) or a descendant (`group-*`) —
 * then moves focus away and screenshots the region again. The element shows
 * its focus when enough pixels changed by a CIE76 ΔE of 10 or more: a quarter
 * of a 1 px line around it, or its shorter side if that is less, and never
 * fewer than 12. What fails: a cut corner (`clip-path`) or an `overflow` that
 * cuts the indicator off, a missing focus style, a focus ring that matches the
 * ring the element already has (a selection ring), a visually hidden element
 * that takes focus while nothing visible shows it. A Tab walk from before the
 * example tells the tab stops from the elements focus only reaches otherwise.
 *
 * `--forced-colors` renders the page as Windows' high-contrast themes do:
 * box-shadows are dropped, focus rings among them, so an element that hides
 * its outline with `outline-none` instead of `outline-hidden` fails there.
 *
 * Usage (local only: it needs Playwright's Chromium, `npx playwright install
 * chromium`, or another Chromium given with `--chromium`):
 *
 *   npm run audit:focus
 *   npm run audit:focus -- --theme dark --surface pixel --only PixelButton,PixelChip
 *   npm run audit:focus -- --forced-colors
 *   npm run audit:focus -- --chromium /path/to/chrome
 *
 * Options:
 *   --theme <dark,light>       Themes to render (default: both)
 *   --surface <pixel,linear>   Surfaces to render (default: both)
 *   --only <Name,…>            Only these components' examples
 *   --forced-colors            Emulate forced-colors mode
 *   --chromium <path>          Chromium to drive instead of Playwright's own
 *   --out <dir>                Output folder (default: test-results/focus-audit)
 *
 * It writes the page it drives and, per theme, a JSON line per example and
 * surface (every focusable element and what focus changed) to the output
 * folder, and prints the elements that show no focus, by component.
 *
 * Exit codes:
 *   0  every element the keyboard reaches shows focus: the tab stops, and the
 *      items a composite widget moves focus between with the arrow keys
 *   1  some do not, or the audit failed
 */
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildPage } from './page';
import { changedPixels, crop, decodePng, pixelsNeeded, type Image } from './pixels';
import type { Box, ElementInfo, FocusInfo, Surface } from './probe';

type Theme = 'dark' | 'light';

interface Options {
  themes: Theme[];
  surfaces: Surface[];
  only: string[] | undefined;
  forcedColors: boolean;
  chromium: string | undefined;
  out: string;
}

/**
 * The part of Playwright the audit drives, typed here so the scripts need not
 * depend on Playwright's types; Playwright itself is loaded on demand.
 */
interface PwPage {
  clock: {
    install(options: { time: number }): Promise<void>;
    pauseAt(time: number): Promise<void>;
    runFor(ms: number): Promise<void>;
  };
  keyboard: { press(key: string): Promise<void> };
  goto(url: string): Promise<unknown>;
  evaluate<R>(fn: () => R): Promise<Awaited<R>>;
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<Awaited<R>>;
  screenshot(options: { clip?: { x: number; y: number; width: number; height: number }; caret: 'hide'; scale: 'css' }): Promise<Buffer>;
  setViewportSize(size: { width: number; height: number }): Promise<void>;
  viewportSize(): { width: number; height: number } | null;
  close(): Promise<void>;
}
interface PwContext {
  newPage(): Promise<PwPage>;
  close(): Promise<void>;
}
interface PwBrowser {
  newContext(options: {
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
    reducedMotion: 'reduce';
    colorScheme: Theme;
    forcedColors: 'active' | 'none';
  }): Promise<PwContext>;
  close(): Promise<void>;
}
interface PwModule {
  chromium: { launch(options: { executablePath?: string }): Promise<PwBrowser> };
}

/** An element's result: measured, or why not. */
interface ElementResult extends ElementInfo {
  index: number;
  tabStop: boolean;
  skipped?: 'gone' | 'not focused' | 'off the page';
  focusVisible?: boolean;
  changedPixels?: number;
  pixelsNeeded?: number;
  visible?: boolean;
  /** Why focus does not show, for an element that does not show it. */
  hint?: string;
  changed?: FocusInfo['changed'];
}

interface ExampleResult {
  theme: Theme;
  forcedColors: boolean;
  surface: Surface;
  component: string;
  id: string;
  errors: string[];
  leaked: boolean;
  elements: ElementResult[];
}

const WIDTH = 1280;
const HEIGHT = 900;
/** Pages longer than this are cut. */
const MAX_HEIGHT = 6000;
/** A fixed time: examples that show dates or count down render the same on every run. */
const NOW = Date.UTC(2026, 0, 15, 10);

/**
 * Roles of the items a composite widget moves focus between with the arrow
 * keys (a roving tabindex): the keyboard reaches them though they are not
 * tab stops.
 */
const ROVING_ROLES = new Set(['gridcell', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'radio', 'tab', 'treeitem']);

const keyboardReached = (element: ElementResult) => element.tabStop || ROVING_ROLES.has(element.role ?? '');

function parseOptions(argv: string[], repoRoot: string): Options {
  const options: Options = {
    themes: ['dark', 'light'],
    surfaces: ['pixel', 'linear'],
    only: undefined,
    forcedColors: false,
    chromium: undefined,
    out: path.join(repoRoot, 'test-results/focus-audit'),
  };
  const list = <T extends string>(value: string | undefined, allowed: readonly T[], flag: string): T[] => {
    const values = (value ?? '').split(',').filter(Boolean);
    const unknown = values.filter((v) => !allowed.includes(v as T));
    if (values.length === 0 || unknown.length > 0) throw new Error(`${flag} takes ${allowed.join(', ')}`);
    return values as T[];
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--theme') options.themes = list(argv[++i], ['dark', 'light'] as const, flag);
    else if (flag === '--surface') options.surfaces = list(argv[++i], ['pixel', 'linear'] as const, flag);
    else if (flag === '--only') options.only = (argv[++i] ?? '').split(',').filter(Boolean);
    else if (flag === '--forced-colors') options.forcedColors = true;
    else if (flag === '--chromium') options.chromium = argv[++i];
    else if (flag === '--out') options.out = path.resolve(argv[++i] ?? options.out);
    else throw new Error(`unknown option ${flag}`);
  }
  return options;
}

/** The box focus has to show on: the element's, or for a visually hidden one the largest box that changed. */
function controlBox(info: FocusInfo): Box {
  if (info.box.w >= 4 && info.box.h >= 4) return info.box;
  return info.changed.reduce((largest, c) => (c.box.w * c.box.h > largest.w * largest.h ? c.box : largest), info.box);
}

/** Why focus does not show on an element, read from what focus changed. */
function hint(info: FocusInfo): string {
  if ((info.box.w < 4 || info.box.h < 4) && info.changed.every((c) => c.relation === 'self')) {
    return 'visually hidden: nothing visible shows its focus';
  }
  if (info.changed.length === 0) return 'no style changes on focus';
  const ring = info.changed.find((c) => c.properties.some((p) => p === 'box-shadow' || p.startsWith('outline')));
  if (ring?.clipPath) {
    const holder = ring.relation === 'self' ? 'its ring' : `the ring on its ${ring.relation} (${ring.tag})`;
    return `${holder} is cut off by that element's own clip-path (a cut corner)`;
  }
  if (info.clippingAncestors.length > 0) return `cut off by an ancestor: ${info.clippingAncestors[0]}`;
  const properties = [...new Set(info.changed.flatMap((c) => c.properties))];
  return `changes ${properties.join(', ')} too little to see`;
}

async function audit(options: Options, repoRoot: string): Promise<boolean> {
  let pw: PwModule;
  try {
    pw = (await import('playwright')) as unknown as PwModule;
  } catch {
    throw new Error('the focus audit needs Playwright (`npm install --no-save playwright`) and its Chromium (`npx playwright install chromium`)');
  }
  await mkdir(options.out, { recursive: true });
  const html = await buildPage(repoRoot, path.join(options.out, 'page'));
  const browser = await pw.chromium.launch({ executablePath: options.chromium });
  let ok = true;
  try {
    for (const theme of options.themes) {
      const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        colorScheme: theme,
        forcedColors: options.forcedColors ? 'active' : 'none',
      });
      const name = `${theme}${options.forcedColors ? '-forced-colors' : ''}`;
      const file = path.join(options.out, `${name}.jsonl`);
      const results = await auditTheme(context, html, theme, options, file);
      await context.close();
      const shown = path.relative(repoRoot, file).startsWith('..') ? file : path.relative(repoRoot, file);
      ok = report(results, `${theme} theme${options.forcedColors ? ', forced colors' : ''}`, shown) && ok;
    }
  } finally {
    await browser.close();
  }
  return ok;
}

async function auditTheme(context: PwContext, html: string, theme: Theme, options: Options, file: string): Promise<ExampleResult[]> {
  const sink = createWriteStream(file);
  let page = await context.newPage();
  const load = async () => {
    await page.clock.install({ time: NOW });
    await page.goto(pathToFileURL(html).href);
    await page.clock.pauseAt(NOW + 1000);
  };
  await load();
  const examples = await page.evaluate(() => window.focusAudit.examples());

  const screenshot = async (box?: Box): Promise<Image> =>
    decodePng(await page.screenshot({ clip: box && { x: box.x, y: box.y, width: box.w, height: box.h }, caret: 'hide', scale: 'css' }));

  /** Mounts an example; its focusable elements and the page before any focus. */
  const mount = async (index: number, surface: Surface) => {
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), theme === 'dark');
    const error = await page.evaluate(([i, s]) => window.focusAudit.mount(i, s), [index, surface] as const);
    await page.clock.runFor(1500);
    const height = await page.evaluate(() => window.focusAudit.contentHeight());
    if (height > HEIGHT) {
      await page.setViewportSize({ width: WIDTH, height: Math.min(height + 16, MAX_HEIGHT) });
      await page.clock.runFor(200);
    }
    const elements = await page.evaluate(() => window.focusAudit.collect());
    return { error, elements, before: await screenshot() };
  };

  /** Unmounts the example; whether anything outlived it, in which case the audit goes on in a fresh page. */
  const unmount = async () => {
    await page.evaluate(() => window.focusAudit.unmount());
    await page.clock.runFor(200);
    const leaked = await page.evaluate(() => window.focusAudit.leaked());
    if (leaked) {
      await page.close();
      page = await context.newPage();
      await load();
    }
    return leaked;
  };

  const settle = () => page.evaluate(() => window.focusAudit.settle());

  /** Gives element `index` keyboard focus and measures what changed; whether the DOM changed meanwhile. */
  const measure = async (index: number, before: Image, result: ElementResult): Promise<boolean> => {
    await page.evaluate(() => window.focusAudit.prepare());
    // A key press first, so the browser takes the focus that follows for keyboard focus.
    await page.keyboard.press('Shift');
    if (!(await page.evaluate((i) => window.focusAudit.focus(i), index))) {
      result.skipped = 'gone';
      return (await settle()) > 0;
    }
    await page.clock.runFor(32);
    const info = await page.evaluate((i) => window.focusAudit.afterFocus(i), index);
    const { region } = info;
    if (!info.focused || region.w <= 0 || region.h <= 0 || region.y + region.h > (page.viewportSize()?.height ?? HEIGHT)) {
      result.skipped = info.focused ? 'off the page' : 'not focused';
      await page.evaluate(() => window.focusAudit.blur());
      await page.clock.runFor(32);
      return (await settle()) > 0;
    }
    const focused = await screenshot(region);
    await page.evaluate(() => window.focusAudit.blur());
    await page.clock.runFor(32);
    const blurred = await screenshot(region);
    result.focusVisible = info.focusVisible;
    result.changedPixels = changedPixels(focused, blurred, crop(before, region), region, info.clipEdges);
    result.pixelsNeeded = pixelsNeeded(controlBox(info));
    result.visible = result.changedPixels >= result.pixelsNeeded;
    if (!result.visible) {
      result.hint = hint(info);
      result.changed = info.changed;
    }
    return (await settle()) > 0;
  };

  const results: ExampleResult[] = [];
  const started = Date.now();
  for (const [index, example] of examples.entries()) {
    if (options.only && !options.only.includes(example.component)) continue;
    for (const surface of options.surfaces) {
      let mounted = await mount(index, surface);
      const result: ExampleResult = {
        theme,
        forcedColors: options.forcedColors,
        surface,
        ...example,
        errors: [...(mounted.error ? [mounted.error] : []), ...(await page.evaluate(() => window.focusAudit.errors()))],
        leaked: false,
        elements: mounted.elements.map((element, i) => ({ ...element, index: i, tabStop: false })),
      };
      let remounted = false;
      for (const element of result.elements) {
        const mutated = await measure(element.index, mounted.before, element);
        if (mutated && element.index < result.elements.length - 1) {
          // Focus or the blur changed the DOM: the next element is measured on a fresh mount.
          result.leaked = (await unmount()) || result.leaked;
          mounted = await mount(index, surface);
          remounted = true;
          if (mounted.elements.length !== result.elements.length) result.errors.push('a fresh mount rendered other focusable elements');
        }
      }
      // A Tab walk from before the example, on a fresh mount if focus changed it.
      if (remounted) {
        result.leaked = (await unmount()) || result.leaked;
        await mount(index, surface);
      }
      await page.evaluate(() => window.focusAudit.startTabWalk());
      const reached = new Set<number>();
      for (let step = 0; step < 300; step++) {
        await page.keyboard.press('Tab');
        const stop = await page.evaluate(() => window.focusAudit.tabStop());
        if (stop === 'outside') break;
        if (typeof stop === 'object') {
          if (reached.has(stop.index)) break;
          reached.add(stop.index);
        }
      }
      for (const element of result.elements) element.tabStop = reached.has(element.index);
      result.leaked = (await unmount()) || result.leaked;
      sink.write(`${JSON.stringify(result)}\n`);
      results.push(result);
    }
    if (index % 50 === 0) process.stderr.write(`[${theme}] ${index}/${examples.length} examples, ${Math.round((Date.now() - started) / 1000)} s\n`);
  }
  await new Promise((done) => sink.end(done));
  await page.close();
  return results;
}

/** Prints what a theme's run found; whether every element the keyboard reaches shows focus. */
function report(results: ExampleResult[], title: string, file: string): boolean {
  const lines = [`\nFocus audit, ${title} (details: ${file})`];
  let ok = true;
  for (const surface of ['pixel', 'linear'] as const) {
    const mounts = results.filter((r) => r.surface === surface);
    if (mounts.length === 0) continue;
    const elements = mounts.flatMap((r) => r.elements.map((element) => ({ ...element, example: `${r.component}/${r.id}` })));
    const measured = elements.filter((e) => e.visible !== undefined);
    const failing = measured.filter((e) => !e.visible);
    const reachedFailing = failing.filter(keyboardReached);
    ok &&= reachedFailing.length === 0 && mounts.every((r) => r.errors.length === 0);
    lines.push(
      `  ${surface}: ${mounts.length} examples, ${measured.length} focusable elements measured ` +
        `(${measured.filter((e) => e.tabStop).length} tab stops, ${measured.filter((e) => !e.tabStop && keyboardReached(e)).length} roving items); ` +
        `no visible focus: ${failing.filter((e) => e.tabStop).length} tab stops, ` +
        `${reachedFailing.length - failing.filter((e) => e.tabStop).length} roving items, ` +
        `${failing.length - reachedFailing.length} elements focus only reaches from a script or the pointer`,
    );
    const skipped = elements.filter((e) => e.skipped);
    if (skipped.length > 0) lines.push(`    not measured: ${skipped.length} (${[...new Set(skipped.map((e) => e.skipped))].join(', ')})`);
    for (const r of mounts.filter((m) => m.errors.length > 0)) lines.push(`    error in ${r.component}/${r.id}: ${r.errors[0]!.split('\n')[0]}`);
    const groups = new Map<string, string[]>();
    for (const e of failing) {
      const role = e.role ? `[role=${e.role}]` : '';
      const key = `${keyboardReached(e) ? '' : '(not keyboard-reached) '}${e.owners[0] ?? '(example markup)'} ${e.tag}${role} — ${e.hint}`;
      groups.set(key, [...(groups.get(key) ?? []), e.example]);
    }
    for (const [key, where] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
      const examples = [...new Set(where)];
      lines.push(`    ${where.length} × ${key} — in ${examples.slice(0, 3).join(', ')}${examples.length > 3 ? `, and ${examples.length - 3} more` : ''}`);
    }
  }
  process.stdout.write(`${lines.join('\n')}\n`);
  return ok;
}

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
let options: Options;
try {
  options = parseOptions(process.argv.slice(2), repoRoot);
} catch (error) {
  process.stderr.write(`${(error as Error).message}\nUsage: see the header of scripts/focus-audit/run.ts\n`);
  process.exit(1);
}
audit(options, repoRoot).then(
  (ok) => process.exit(ok ? 0 : 1),
  (error) => {
    process.stderr.write(`focus audit failed: ${(error as Error).stack ?? error}\n`);
    process.exit(1);
  },
);
