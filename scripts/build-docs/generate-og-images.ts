/**
 * generate-og-images
 *
 * For each component manifest, render a PNG OG image at
 * `apps/web/public/og/<kebab-name>.png` using Playwright headless + a self-
 * contained HTML template (pixel-art grid background + component name in
 * pixel font + tone tint + category badge + version chip).
 *
 * SAFE: only writes under `apps/web/public/og/*.png`. The template is built
 * in-memory and never touches hand-authored files. Existing PNGs at the
 * target path are overwritten (they are themselves generated artifacts —
 * the whole `apps/web/public/og/` directory is gitignored).
 *
 * ARCHITECTURE (orchestrator step): the orchestrator's GeneratorWrite
 * contract is utf-8 text only, so PNG bytes can never travel through it.
 * `GenerateOgImagesGenerator` therefore delegates to `generateOgImages()`
 * (the same Playwright-backed path the standalone CLI uses), which writes
 * the binary PNGs itself, and the step contributes ZERO orchestrator
 * writes. When Playwright (or its Chromium binary) is not available, the
 * step SKIPs honestly: a logged warning with the install/CLI instructions,
 * zero files written — it never writes HTML bytes to a `.png` path.
 *
 * Usage (CLI):
 *   tsx scripts/build-docs/generate-og-images.ts                     # writes PNGs
 *   tsx scripts/build-docs/generate-og-images.ts --dry               # plan only
 *   tsx scripts/build-docs/generate-og-images.ts --json              # JSON report
 *   tsx scripts/build-docs/generate-og-images.ts --root <path>       # custom repo root
 *   tsx scripts/build-docs/generate-og-images.ts --out-root <path>   # custom out dir
 *   tsx scripts/build-docs/generate-og-images.ts --only Pixel*       # filter glob
 *
 * Exit codes:
 *   0  success (all images written / planned)
 *   1  failure (load error, render error, browser launch error)
 */

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";
import pc from "picocolors";
import { kebabCase } from "change-case";

import {
  Generator,
  readManifest,
  type GeneratorContext,
  type GeneratorResult,
  type ManifestRecord,
  type Manifest as PermissiveManifest,
} from "./_lib/generator-base.js";
import { createLogger, type Logger } from "./_lib/logger.js";
import { findComponentDirs } from "./_lib/scan-fs.js";

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const DEFAULT_VERSION = "1.0.0";
export const DEFAULT_TONE: ToneKey = "neutral";
export const DEFAULT_CATEGORY = "components";

export type ToneKey =
  | "neutral"
  | "green"
  | "cyan"
  | "gold"
  | "red"
  | "purple"
  | "pink";

/** Tone tint palette — paired with the cinematic dark base. */
export const TONE_TINTS: Record<ToneKey, { glow: string; accent: string }> = {
  neutral: { glow: "rgba(148, 163, 184, 0.35)", accent: "#94a3b8" },
  green: { glow: "rgba(34, 197, 94, 0.40)", accent: "#22c55e" },
  cyan: { glow: "rgba(14, 165, 233, 0.45)", accent: "#0ea5e9" },
  gold: { glow: "rgba(234, 179, 8, 0.40)", accent: "#eab308" },
  red: { glow: "rgba(244, 63, 94, 0.40)", accent: "#f43f5e" },
  purple: { glow: "rgba(168, 85, 247, 0.45)", accent: "#a855f7" },
  pink: { glow: "rgba(236, 72, 153, 0.40)", accent: "#ec4899" },
};

/** Category → default tone fallback (used when manifest doesn't pin a tone). */
const CATEGORY_TONE_DEFAULTS: Record<string, ToneKey> = {
  actions: "cyan",
  cards: "purple",
  data: "cyan",
  feedback: "gold",
  forms: "green",
  hero: "purple",
  layout: "neutral",
  navigation: "cyan",
  "overlay-foundation": "neutral",
  overlays: "pink",
  animations: "purple",
  parallax: "cyan",
};

export interface OgImagePlanEntry {
  /** Component name from the manifest (e.g. PixelButton). */
  name: string;
  /** Kebab-case slug used for filename and url. */
  slug: string;
  /** Absolute POSIX path of the output PNG file. */
  outFile: string;
  /** Category label rendered on the badge (defaults to "components"). */
  category: string;
  /** Version chip text (e.g. "v1.0.0"). */
  version: string;
  /** Resolved tone key driving the tint. */
  tone: ToneKey;
}

export interface RenderBackend {
  /**
   * Render an HTML string at width x height and save it as a PNG at `outPath`.
   * Implementations: PlaywrightRenderer (real), MemoryRenderer (tests).
   */
  render(html: string, outPath: string, width: number, height: number): Promise<void>;
  /** Optional teardown (close browser, etc.). */
  close?(): Promise<void>;
}

export interface GenerateOgImagesOptions {
  repoRoot: string;
  /** Output directory; default: <root>/apps/web/public/og */
  outRoot?: string;
  /** Pre-loaded manifests; if omitted the generator scans the FS. */
  manifests?: ManifestRecord[];
  /** When true, do not render — return the plan only. */
  dryRun?: boolean;
  /** Optional glob (substring match) to filter manifests by name. */
  only?: string;
  /** Injectable renderer (Playwright by default). */
  renderer?: RenderBackend;
  logger?: Logger;
}

export interface GenerateOgImagesReport {
  ok: boolean;
  count: number;
  written: number;
  skipped: number;
  entries: OgImagePlanEntry[];
  errors: Array<{ name?: string; file?: string; message: string }>;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function ensurePosix(p: string): string {
  return p.split(path.sep).join("/");
}

/** Convert a component PascalCase name to a kebab-case slug. */
export function slugFor(name: string): string {
  return kebabCase(name);
}

/** Escape arbitrary text for safe embedding in an HTML text node. */
export function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Normalize a free-form category label to a kebab-case slug. */
export function normalizeCategory(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return DEFAULT_CATEGORY;
  }
  return kebabCase(value);
}

/** Resolve a tone key from manifest extras with safe fallbacks. */
export function resolveTone(manifest: PermissiveManifest): ToneKey {
  const explicit = (manifest as { tone?: unknown }).tone;
  if (typeof explicit === "string" && (explicit as ToneKey) in TONE_TINTS) {
    return explicit as ToneKey;
  }
  // Walk tags for a tone hint.
  const tags = Array.isArray(manifest.tags) ? manifest.tags : [];
  for (const t of tags) {
    if (typeof t === "string" && (t as ToneKey) in TONE_TINTS) {
      return t as ToneKey;
    }
  }
  const cat = typeof manifest.category === "string" ? kebabCase(manifest.category) : "";
  if (cat && CATEGORY_TONE_DEFAULTS[cat]) {
    return CATEGORY_TONE_DEFAULTS[cat]!;
  }
  return DEFAULT_TONE;
}

/** Resolve the version chip text from manifest (`since`). */
export function resolveVersion(manifest: PermissiveManifest): string {
  const since = (manifest as { since?: unknown }).since;
  if (typeof since === "string" && since.trim().length > 0) {
    return `v${since.trim().replace(/^v/, "")}`;
  }
  return `v${DEFAULT_VERSION}`;
}

/** Build a single plan entry from a manifest record. */
export function planEntryFor(
  rec: ManifestRecord,
  outRoot: string,
): OgImagePlanEntry {
  const manifest = rec.manifest as PermissiveManifest;
  const name = manifest.name;
  if (!name || typeof name !== "string") {
    throw new Error(
      `manifest at ${rec.manifestFile} is missing a string \`name\` field`,
    );
  }
  const slug = slugFor(name);
  const category = normalizeCategory(manifest.category);
  const version = resolveVersion(manifest);
  const tone = resolveTone(manifest);
  const outFile = ensurePosix(path.join(outRoot, `${slug}.png`));
  return { name, slug, outFile, category, version, tone };
}

// ---------------------------------------------------------------------------
// HTML template
// ---------------------------------------------------------------------------

/**
 * Render the self-contained OG HTML template for one component. The template
 * embeds all styles inline so Playwright can screenshot without network IO.
 */
export function renderOgHtml(entry: OgImagePlanEntry): string {
  const tint = TONE_TINTS[entry.tone];
  const name = escapeHtml(entry.name);
  const category = escapeHtml(entry.category);
  const version = escapeHtml(entry.version);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${name} — pxlkit OG</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${OG_WIDTH}px; height: ${OG_HEIGHT}px; overflow: hidden; }
  body {
    font-family: 'Press Start 2P', 'Courier New', ui-monospace, monospace;
    color: #f1f5f9;
    background:
      radial-gradient(ellipse at 30% 25%, ${tint.glow} 0%, transparent 55%),
      radial-gradient(ellipse at 80% 90%, rgba(15, 23, 42, 0.6) 0%, transparent 60%),
      linear-gradient(135deg, #0b1120 0%, #0f172a 60%, #020617 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 64px 80px;
  }
  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse at center, black 35%, transparent 90%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 35%, transparent 90%);
  }
  .scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.03) 0,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px,
      transparent 3px
    );
    pointer-events: none;
  }
  .row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
  }
  .brand {
    font-size: 22px;
    letter-spacing: 0.18em;
    color: ${tint.accent};
    text-shadow: 0 0 12px ${tint.glow};
  }
  .badge {
    font-size: 18px;
    padding: 10px 18px;
    border: 2px solid ${tint.accent};
    color: ${tint.accent};
    text-transform: uppercase;
    letter-spacing: 0.15em;
    background: rgba(2, 6, 23, 0.6);
  }
  .center {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 26px;
    align-items: flex-start;
  }
  .title {
    font-size: 86px;
    line-height: 1.1;
    letter-spacing: 0.02em;
    color: #ffffff;
    text-shadow:
      0 0 24px ${tint.glow},
      4px 4px 0 rgba(2, 6, 23, 0.85);
    word-break: break-word;
  }
  .pixel-bar {
    width: 220px;
    height: 14px;
    background: ${tint.accent};
    box-shadow: 0 0 24px ${tint.glow};
    image-rendering: pixelated;
  }
  .version {
    font-size: 18px;
    padding: 8px 16px;
    background: rgba(2, 6, 23, 0.75);
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.3);
    letter-spacing: 0.1em;
  }
  .meta {
    color: rgba(203, 213, 225, 0.7);
    font-size: 16px;
    letter-spacing: 0.18em;
  }
</style>
</head>
<body data-testid="og-card" data-component="${name}" data-tone="${entry.tone}">
  <div class="grid"></div>
  <div class="scanlines"></div>
  <div class="row">
    <div class="brand">PXLKIT</div>
    <div class="badge">${category}</div>
  </div>
  <div class="center">
    <div class="pixel-bar"></div>
    <h1 class="title">${name}</h1>
    <div class="meta">RETRO · ACCESSIBLE · TREE-SHAKABLE</div>
  </div>
  <div class="row">
    <div class="version">${version}</div>
    <div class="meta">pxlkit.xyz / ui-kit / ${entry.slug}</div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

/**
 * Minimal Playwright surface used by PlaywrightRenderer. Typed locally so we
 * don't have to import @types/playwright across every script consumer.
 */
interface MinimalPwPage {
  setContent(html: string, opts?: unknown): Promise<void>;
  screenshot(opts: { path: string; type?: "png"; fullPage?: boolean }): Promise<unknown>;
}
interface MinimalPwContext {
  newPage(): Promise<MinimalPwPage>;
  close(): Promise<void>;
}
interface MinimalPwBrowser {
  newContext(opts: unknown): Promise<MinimalPwContext>;
  close(): Promise<void>;
}
interface MinimalPwModule {
  chromium: {
    launch(opts?: unknown): Promise<MinimalPwBrowser>;
    /** Absolute path of the managed Chromium binary (playwright ≥1.x). */
    executablePath?(): string;
  };
}

/**
 * Lazy Playwright-backed renderer. The browser is launched on first use and
 * reused across all writes; callers should invoke `close()` when finished.
 */
export class PlaywrightRenderer implements RenderBackend {
  private browserPromise: Promise<MinimalPwBrowser> | null = null;

  constructor(private readonly logger: Logger = createLogger("generate-og-images")) {}

  private getBrowser(): Promise<MinimalPwBrowser> {
    if (!this.browserPromise) {
      this.browserPromise = (async () => {
        // Dynamic import keeps Playwright optional for unit tests / dry runs.
        const pw = (await import("playwright")) as unknown as MinimalPwModule;
        return pw.chromium.launch({ headless: true });
      })();
    }
    return this.browserPromise;
  }

  async render(html: string, outPath: string, width: number, height: number): Promise<void> {
    const browser = await this.getBrowser();
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    try {
      const page = await ctx.newPage();
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await fs.ensureDir(path.dirname(outPath));
      await page.screenshot({ path: outPath, type: "png", fullPage: false });
      this.logger.success(`og → ${ensurePosix(outPath)}`);
    } finally {
      await ctx.close();
    }
  }

  async close(): Promise<void> {
    const pending = this.browserPromise;
    if (!pending) return;
    this.browserPromise = null;
    try {
      const browser = await pending;
      await browser.close();
    } catch {
      // best-effort teardown
    }
  }
}

/**
 * In-memory test renderer — writes the HTML source as a `.html.txt` sidecar
 * next to where the PNG would go, and writes a single-byte placeholder PNG.
 * Used by unit tests to verify the plan/write contract without Playwright.
 */
export class MemoryRenderer implements RenderBackend {
  public readonly captured: Array<{ outPath: string; html: string }> = [];

  async render(html: string, outPath: string): Promise<void> {
    this.captured.push({ outPath, html });
    await fs.ensureDir(path.dirname(outPath));
    // Smallest valid PNG header so consumers that sniff the file still see PNG.
    const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await fs.writeFile(outPath, PNG_SIG);
  }
}

// ---------------------------------------------------------------------------
// Manifest loading
// ---------------------------------------------------------------------------

async function loadManifestsForRoot(
  root: string,
  logger: Logger,
): Promise<ManifestRecord[]> {
  const dirs = await findComponentDirs(root);
  const records: ManifestRecord[] = [];
  for (const dir of dirs) {
    const entries = await fs.readdir(dir);
    const manifests = entries.filter((e) => e.endsWith(".manifest.ts"));
    for (const m of manifests) {
      const file = path.join(dir, m);
      try {
        const rec = await readManifest(file);
        if (rec) records.push(rec);
      } catch (err) {
        logger.warn(
          `skip manifest ${ensurePosix(file)}: ${(err as Error).message}`,
        );
      }
    }
  }
  return records;
}

/** Substring filter for --only flag (`*` wildcard matches anything). */
function matchesFilter(name: string, filter: string | undefined): boolean {
  if (!filter || filter === "*") return true;
  const re = new RegExp(
    "^" + filter.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
    "i",
  );
  return re.test(name);
}

// ---------------------------------------------------------------------------
// Generator class
// ---------------------------------------------------------------------------

/**
 * Probe whether the Playwright render path is actually usable: the package
 * must resolve AND its managed Chromium binary must exist on disk. Cheap —
 * no browser is launched.
 */
export async function isPlaywrightUsable(): Promise<boolean> {
  try {
    const pw = (await import("playwright")) as unknown as MinimalPwModule;
    const exe = pw.chromium.executablePath?.();
    // Can't introspect the binary path on this playwright version — assume
    // usable and let real render errors surface (and fail the step) honestly.
    if (!exe) return true;
    return await fs.pathExists(exe);
  } catch {
    return false;
  }
}

export interface GenerateOgImagesGeneratorOptions {
  /**
   * Injectable render backend (tests use MemoryRenderer). When provided the
   * availability probe is skipped — the caller vouches for the backend.
   */
  renderer?: RenderBackend;
  /** Injectable availability probe. Defaults to {@link isPlaywrightUsable}. */
  probe?: () => Promise<boolean>;
}

export class GenerateOgImagesGenerator extends Generator {
  name = "generate-og-images";

  constructor(
    private readonly outRoot: string,
    private readonly options: GenerateOgImagesGeneratorOptions = {},
  ) {
    super();
  }

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const usable = this.options.renderer
      ? true
      : await (this.options.probe ?? isPlaywrightUsable)();

    if (!usable) {
      ctx.logger.warn(
        "generate-og-images: SKIP — playwright (or its chromium binary) is not available; wrote 0 files. " +
          "To render the PNG OG cards: `npx playwright install chromium`, then " +
          "`npx tsx scripts/build-docs/generate-og-images.ts`.",
      );
      return { writes: [] };
    }

    const report = await generateOgImages({
      repoRoot: ctx.repoRoot,
      outRoot: this.outRoot,
      manifests: ctx.manifests,
      renderer: this.options.renderer,
      logger: ctx.logger,
    });

    if (!report.ok) {
      const first = report.errors[0];
      throw new Error(
        `generate-og-images: ${report.errors.length} error(s) — first: ${first?.name ?? "?"}: ${first?.message ?? "unknown"}`,
      );
    }

    ctx.logger.info(
      `generate-og-images: rendered ${report.written} PNG(s) → ${ensurePosix(this.outRoot)} (binary writes, outside the orchestrator text-write contract)`,
    );
    // PNGs are binary and written by the render backend itself; the utf-8
    // GeneratorWrite contract intentionally carries nothing here.
    return { writes: [] };
  }
}

// ---------------------------------------------------------------------------
// Programmatic API (default export)
// ---------------------------------------------------------------------------

export async function generateOgImages(
  opts: GenerateOgImagesOptions,
): Promise<GenerateOgImagesReport> {
  const logger = opts.logger ?? createLogger("generate-og-images");
  const repoRoot = path.resolve(opts.repoRoot);
  const outRoot =
    opts.outRoot ??
    ensurePosix(path.join(repoRoot, "apps", "web", "public", "og"));

  const errors: GenerateOgImagesReport["errors"] = [];

  let manifests: ManifestRecord[];
  if (opts.manifests) {
    manifests = opts.manifests;
  } else {
    manifests = await loadManifestsForRoot(repoRoot, logger);
  }

  // Apply --only filter against manifest.name.
  if (opts.only) {
    const before = manifests.length;
    manifests = manifests.filter((m) =>
      matchesFilter((m.manifest as PermissiveManifest).name ?? "", opts.only),
    );
    logger.info(`filter "${opts.only}" matched ${manifests.length}/${before}`);
  }

  const entries: OgImagePlanEntry[] = [];
  let written = 0;
  let skipped = 0;

  // Renderer is only constructed when we actually need to render.
  let renderer: RenderBackend | undefined = opts.renderer;
  const ownsRenderer = !renderer && !opts.dryRun;
  if (ownsRenderer) {
    renderer = new PlaywrightRenderer(logger);
  }

  try {
    for (const rec of manifests) {
      let entry: OgImagePlanEntry;
      try {
        entry = planEntryFor(rec, outRoot);
      } catch (err) {
        errors.push({
          name: (rec.manifest as PermissiveManifest).name,
          file: rec.manifestFile,
          message: (err as Error).message,
        });
        continue;
      }
      entries.push(entry);
      if (opts.dryRun) {
        skipped++;
        continue;
      }
      try {
        const html = renderOgHtml(entry);
        await renderer!.render(html, entry.outFile, OG_WIDTH, OG_HEIGHT);
        written++;
      } catch (err) {
        errors.push({
          name: entry.name,
          file: entry.outFile,
          message: (err as Error).message,
        });
      }
    }
  } finally {
    if (ownsRenderer && renderer?.close) {
      await renderer.close();
    }
  }

  const ok = errors.length === 0;
  return {
    ok,
    count: manifests.length,
    written,
    skipped,
    entries,
    errors,
  };
}

export default generateOgImages;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  root: string;
  dry: boolean;
  json: boolean;
  outRoot?: string;
  only?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    root: process.cwd(),
    dry: false,
    json: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry" || a === "--dry-run") args.dry = true;
    else if (a === "--json") args.json = true;
    else if (a === "--root") args.root = String(argv[++i] ?? args.root);
    else if (a === "--out-root") args.outRoot = String(argv[++i] ?? "");
    else if (a === "--only") args.only = String(argv[++i] ?? "");
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`generate-og-images — render PNG OG cards per component manifest

Options:
  --root <path>     Repository root (default: cwd)
  --out-root <path> Output dir (default: <root>/apps/web/public/og)
  --only <glob>     Filter manifests by component name (wildcards: *)
  --dry, --dry-run  Plan only — do not launch Playwright or write files
  --json            Emit a machine-readable JSON report on stdout
  -h, --help        Show this help`);
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);
  const logger = createLogger("generate-og-images");

  try {
    const report = await generateOgImages({
      repoRoot: args.root,
      outRoot: args.outRoot,
      dryRun: args.dry,
      only: args.only,
      logger,
    });

    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(report, null, 2));
    } else {
      logger.info(
        `manifests: ${report.count} | written: ${report.written} | skipped: ${report.skipped} | errors: ${report.errors.length}`,
      );
      for (const e of report.entries.slice(0, 10)) {
        logger.info(`  ${pc.cyan(e.slug)} (${e.tone}) -> ${ensurePosix(e.outFile)}`);
      }
      if (report.entries.length > 10) {
        logger.info(`  …and ${report.entries.length - 10} more`);
      }
      for (const err of report.errors) {
        logger.error(`${err.name ?? "?"}: ${err.message}`);
      }
      if (report.ok) logger.success("done");
      else logger.error("completed with errors");
    }

    return report.ok ? 0 : 1;
  } catch (err) {
    logger.error((err as Error).stack ?? (err as Error).message);
    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          ok: false,
          count: 0,
          written: 0,
          skipped: 0,
          entries: [],
          errors: [{ message: (err as Error).message }],
        }),
      );
    }
    return 1;
  }
}

// CLI guard — invoked only when executed directly via tsx/node.
if (
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run().then(
    (code) => process.exit(code),
    (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    },
  );
}
