import * as path from 'node:path';
import * as fs from 'fs-extra';
import { glob as fgGlob } from 'fast-glob';

import { Gate, gateFail, gateOk } from '../_lib/gate-base.js';
import type { GateFinding, GateResult } from '../_lib/gate-base.js';
import type { AuditContext } from '../_lib/load-context.js';

export interface DeadLinksOptions {
  /** Override the set of source files to scan (absolute paths). */
  sourceFiles?: string[];
  /** Override the relative glob patterns (relative to repoRoot) used to find docs. */
  patterns?: string[];
}

interface LinkRef {
  /** Absolute path to the file that contains the link. */
  fromFile: string;
  /** Display text inside the [] brackets. */
  text: string;
  /** Raw href as it appears in the source ([](raw)). */
  raw: string;
  /** Target path part of the href, no anchor; empty string for same-file anchors. */
  target: string;
  /** Anchor part of the href (without the leading #); empty string if none. */
  anchor: string;
  /** 1-based line number where the link starts. */
  line: number;
}

const DEFAULT_PATTERNS = [
  'README.md',
  'docs/**/*.md',
  'packages/*/README.md',
  'packages/*/CHANGELOG.md',
  'apps/*/README.md',
  'apps/web/src/app/docs/page.tsx',
  'apps/web/src/app/ui-kit/page.tsx',
];

const MD_LINK_RE = /\[([^\]\n]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const HTML_ID_RE = /\bid\s*=\s*["']([^"']+)["']/g;
const EXPLICIT_ANCHOR_RE = /<a[^>]*\bname\s*=\s*["']([^"']+)["']/g;

const EXTERNAL_PREFIXES = [
  'http://',
  'https://',
  'mailto:',
  'tel:',
  'ftp://',
  'data:',
  'javascript:',
];

function isExternal(href: string): boolean {
  const lower = href.toLowerCase();
  return EXTERNAL_PREFIXES.some((p) => lower.startsWith(p));
}

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function lineOfIndex(source: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i++) {
    if (source.charCodeAt(i) === 10) line++;
  }
  return line;
}

/**
 * GitHub-flavored slug for a heading:
 *  - lowercase
 *  - strip leading/trailing whitespace
 *  - remove anything that isn't a word char, space, or hyphen
 *  - collapse whitespace to single hyphen
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function extractMarkdownLinks(source: string, fromFile: string): LinkRef[] {
  const out: LinkRef[] = [];
  MD_LINK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MD_LINK_RE.exec(source)) !== null) {
    const text = match[1] ?? '';
    const rawHref = (match[2] ?? '').trim();
    if (rawHref.length === 0) continue;
    if (isExternal(rawHref)) continue;
    // Reference-style or images-handled-elsewhere — these still resolve as links.
    // Split target vs anchor.
    let target = rawHref;
    let anchor = '';
    const hashIdx = rawHref.indexOf('#');
    if (hashIdx !== -1) {
      target = rawHref.slice(0, hashIdx);
      anchor = rawHref.slice(hashIdx + 1);
    }
    out.push({
      fromFile,
      text,
      raw: rawHref,
      target,
      anchor,
      line: lineOfIndex(source, match.index),
    });
  }
  return out;
}

export function extractMarkdownHeadings(source: string): Set<string> {
  const slugs = new Set<string>();
  const lines = source.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = '';
  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      const marker = trimmed.slice(0, 3);
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (trimmed.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
      }
      continue;
    }
    if (inFence) continue;
    const m = HEADING_RE.exec(line);
    if (m) {
      const slug = slugifyHeading(m[2] ?? '');
      if (slug.length > 0) slugs.add(slug);
    }
  }
  return slugs;
}

export function extractHtmlIds(source: string): Set<string> {
  const ids = new Set<string>();
  HTML_ID_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = HTML_ID_RE.exec(source)) !== null) {
    if (m[1]) ids.add(m[1]);
  }
  EXPLICIT_ANCHOR_RE.lastIndex = 0;
  while ((m = EXPLICIT_ANCHOR_RE.exec(source)) !== null) {
    if (m[1]) ids.add(m[1]);
  }
  return ids;
}

/**
 * Anchors available inside a given file. For .md → heading slugs + html ids.
 * For .tsx / .html / other text files → html ids.
 */
async function collectAnchors(targetFile: string): Promise<Set<string>> {
  const raw = await fs.readFile(targetFile, 'utf8');
  const source = stripBom(raw);
  const lower = targetFile.toLowerCase();
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    const headings = extractMarkdownHeadings(source);
    const htmlIds = extractHtmlIds(source);
    for (const id of htmlIds) headings.add(id);
    return headings;
  }
  return extractHtmlIds(source);
}

function resolveTarget(fromFile: string, target: string, repoRoot: string): string {
  if (target.startsWith('/')) {
    // Treat absolute-style links as repo-root relative — common in monorepos.
    return path.resolve(repoRoot, '.' + target);
  }
  return path.resolve(path.dirname(fromFile), target);
}

export class DeadLinksGate extends Gate {
  readonly id = 13;
  readonly name = 'dead-links';
  readonly description =
    'Scan all .md files in docs/ + READMEs + showcase + docs page for internal markdown links. Verify each anchor target exists. Major for broken links.';

  private readonly options: DeadLinksOptions;

  constructor(options: DeadLinksOptions = {}) {
    super();
    this.options = options;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    const files = await this.discoverSources(ctx);
    if (files.length === 0) {
      ctx.logger.debug('dead-links: no source files matched — passing trivially');
      return gateOk(this.name, Date.now() - started);
    }

    const anchorCache = new Map<string, Set<string> | null>();

    for (const fromFile of files) {
      let source: string;
      try {
        source = stripBom(await fs.readFile(fromFile, 'utf8'));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'major',
          file: path.relative(ctx.repoRoot, fromFile) || fromFile,
          message: `failed to read source file: ${message}`,
          suggestion: 'Ensure the file is readable and UTF-8 encoded.',
        });
        continue;
      }

      const links = extractMarkdownLinks(source, fromFile);
      for (const link of links) {
        const rel = path.relative(ctx.repoRoot, fromFile) || fromFile;

        // Same-file anchor: target empty, anchor present.
        if (link.target.length === 0 && link.anchor.length > 0) {
          let anchors = anchorCache.get(fromFile);
          if (anchors === undefined) {
            anchors = await collectAnchors(fromFile).catch(() => null);
            anchorCache.set(fromFile, anchors);
          }
          if (anchors && !anchors.has(link.anchor)) {
            findings.push({
              severity: 'major',
              file: rel,
              message: `Broken anchor "#${link.anchor}" in ${rel}:${link.line} (link text: "${link.text}") — no matching heading or id in same file.`,
              suggestion: `Add a heading whose slug is "${link.anchor}" or fix the anchor in the link.`,
            });
          }
          continue;
        }

        // Resolve external file target.
        const targetAbs = resolveTarget(fromFile, link.target, ctx.repoRoot);
        const exists = await fs.pathExists(targetAbs);
        if (!exists) {
          findings.push({
            severity: 'major',
            file: rel,
            message: `Broken link target "${link.raw}" in ${rel}:${link.line} (link text: "${link.text}") — file not found at ${path.relative(ctx.repoRoot, targetAbs) || targetAbs}.`,
            suggestion: `Fix the path or create the missing file. Internal links should be relative to ${rel}.`,
          });
          continue;
        }

        // If link points at a directory, accept it as-is (covers things like /docs/).
        const stat = await fs.stat(targetAbs).catch(() => null);
        if (stat?.isDirectory()) {
          if (link.anchor.length > 0) {
            findings.push({
              severity: 'major',
              file: rel,
              message: `Link "${link.raw}" in ${rel}:${link.line} points to a directory with an anchor "#${link.anchor}" — anchors are only valid on files.`,
              suggestion: 'Link directly to a file (e.g. README.md) inside the directory or drop the anchor.',
            });
          }
          continue;
        }

        if (link.anchor.length === 0) continue;

        let anchors = anchorCache.get(targetAbs);
        if (anchors === undefined) {
          anchors = await collectAnchors(targetAbs).catch(() => null);
          anchorCache.set(targetAbs, anchors);
        }
        if (anchors && !anchors.has(link.anchor)) {
          const targetRel = path.relative(ctx.repoRoot, targetAbs) || targetAbs;
          findings.push({
            severity: 'major',
            file: rel,
            message: `Broken anchor "#${link.anchor}" in ${rel}:${link.line} → ${targetRel} (link text: "${link.text}") — no matching heading or id.`,
            suggestion: `Add a heading whose slug is "${link.anchor}" in ${targetRel}, or update the link to an existing anchor.`,
          });
        }
      }
    }

    const duration_ms = Date.now() - started;
    ctx.logger.debug(
      `dead-links: scanned ${files.length} file(s), ${findings.length} finding(s) in ${duration_ms}ms`,
    );
    return findings.length === 0
      ? gateOk(this.name, duration_ms)
      : gateFail(this.name, findings, duration_ms);
  }

  private async discoverSources(ctx: AuditContext): Promise<string[]> {
    if (this.options.sourceFiles && this.options.sourceFiles.length > 0) {
      return Array.from(new Set(this.options.sourceFiles)).sort();
    }
    const patterns = this.options.patterns ?? DEFAULT_PATTERNS;
    const matched = await fgGlob(patterns, {
      cwd: ctx.repoRoot,
      absolute: true,
      dot: false,
      onlyFiles: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/build/**'],
    });
    return Array.from(new Set(matched)).sort();
  }
}

export default function createDeadLinksGate(options?: DeadLinksOptions): DeadLinksGate {
  return new DeadLinksGate(options);
}
