import * as path from 'node:path';
import * as fs from 'fs-extra';
import { kebabCase } from 'change-case';
import {
  Gate,
  gateFail,
  gateOk,
  type GateFinding,
  type GateResult,
  type AuditContext,
} from '../_lib/gate-base.js';

const SECTION_ID_RE = /<Section[^>]*\bid\s*=\s*["']([a-z0-9][a-z0-9-]*)["']/gi;
const RAW_ID_RE = /\bid\s*=\s*["']([a-z0-9][a-z0-9-]*)["']/gi;

export interface CoverageDocsOptions {
  /** Override the relative path to the docs page (for tests). */
  docsPageRelPath?: string;
  /** Override the absolute path to the docs page (for tests). Wins over relative. */
  docsPagePath?: string;
}

export class CoverageDocsGate extends Gate {
  id = 5;
  name = 'coverage-docs';
  description =
    'Verify apps/web/src/app/docs/page.tsx contains a section with id=<kebab-component-name> for every registered component. Major if missing.';

  private readonly options: CoverageDocsOptions;

  constructor(options: CoverageDocsOptions = {}) {
    super();
    this.options = options;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();

    const docsPage =
      this.options.docsPagePath ??
      path.join(
        ctx.repoRoot,
        this.options.docsPageRelPath ?? 'apps/web/src/app/docs/page.tsx',
      );

    const findings: GateFinding[] = [];

    if (!(await fs.pathExists(docsPage))) {
      findings.push({
        severity: 'major',
        file: docsPage,
        message: `docs page not found at ${path.relative(ctx.repoRoot, docsPage) || docsPage}`,
        suggestion:
          'Create apps/web/src/app/docs/page.tsx and add a <Section id="..."> for each registered component.',
      });
      return gateFail(this.name, findings, Date.now() - started);
    }

    if (ctx.manifests.length === 0) {
      ctx.logger.debug(
        'coverage-docs: no manifests registered — nothing to verify',
      );
      return gateOk(this.name, Date.now() - started);
    }

    let source: string;
    try {
      source = await fs.readFile(docsPage, 'utf8');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      findings.push({
        severity: 'major',
        file: docsPage,
        message: `failed to read docs page: ${message}`,
        suggestion: 'Ensure the docs page file is readable and well-formed.',
      });
      return gateFail(this.name, findings, Date.now() - started);
    }

    const sectionIds = collectIds(source, SECTION_ID_RE);
    // Fall back to any id attribute if <Section> usage is absent (e.g. plain <section id=...>).
    const allIds =
      sectionIds.size > 0 ? sectionIds : collectIds(source, RAW_ID_RE);

    const seenComponents = new Set<string>();

    for (const record of ctx.manifests) {
      const component = record.component;
      if (!component || seenComponents.has(component)) continue;
      seenComponents.add(component);

      const expectedId = kebabCase(component);
      if (allIds.has(expectedId)) continue;

      findings.push({
        severity: 'major',
        file: path.relative(ctx.repoRoot, docsPage) || docsPage,
        component,
        message: `docs page is missing a section for "${component}" (expected id="${expectedId}").`,
        suggestion: `Add <Section id="${expectedId}" title="${component}">…</Section> to apps/web/src/app/docs/page.tsx (or link the component into an existing section with that id).`,
      });
    }

    const duration_ms = Date.now() - started;
    return findings.length === 0
      ? gateOk(this.name, duration_ms)
      : gateFail(this.name, findings, duration_ms);
  }
}

function collectIds(source: string, regex: RegExp): Set<string> {
  const out = new Set<string>();
  // Reset stateful regex between calls (defensive — we always pass fresh literals,
  // but exported consumers may reuse).
  regex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    if (match[1]) out.add(match[1]);
  }
  return out;
}

export default function createCoverageDocsGate(
  options?: CoverageDocsOptions,
): CoverageDocsGate {
  return new CoverageDocsGate(options);
}
