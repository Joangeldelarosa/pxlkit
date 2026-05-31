import * as path from 'node:path';
import * as fs from 'fs-extra';
import { kebabCase } from 'change-case';

import { Gate, gateFail, gateOk } from '../_lib/gate-base.js';
import type { GateFinding, GateResult } from '../_lib/gate-base.js';
import type { AuditContext } from '../_lib/load-context.js';

/**
 * Resolve the canonical showcase page path inside apps/web.
 * Exported so tests can target it precisely without re-deriving the path.
 */
export function showcasePagePath(ctx: AuditContext): string {
  return path.join(ctx.appsWebSrcDir, 'app', 'ui-kit', 'page.tsx');
}

/**
 * Extract every kebab-style id="..." attribute that appears on a div, section,
 * article, span or generic JSX element in the showcase page source. We only
 * trust lowercase / kebab values because that is the showcase convention; any
 * other id (e.g. accessibility-only ids like "panel-1") is ignored.
 */
export function extractAnchorIds(source: string): Set<string> {
  const ids = new Set<string>();
  const re = /\bid\s*=\s*"([a-z0-9][a-z0-9-]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

/**
 * Convert a component name (PascalCase, camelCase, or already kebab) to the
 * kebab-case anchor expected by the showcase page. Empty / non-string inputs
 * collapse to '' so callers can filter them out cleanly.
 */
export function anchorIdFor(component: string): string {
  if (typeof component !== 'string') return '';
  const trimmed = component.trim();
  if (trimmed.length === 0) return '';
  return kebabCase(trimmed);
}

export class CoverageShowcaseGate extends Gate {
  id = 4;
  name = 'coverage-showcase';
  description =
    'Verify apps/web/src/app/ui-kit/page.tsx contains an anchor div with id=<kebab-component-name> for every registered component. Major if missing.';

  async run(ctx: AuditContext): Promise<GateResult> {
    const start = Date.now();
    const findings: GateFinding[] = [];
    const pageFile = showcasePagePath(ctx);

    if (!(await fs.pathExists(pageFile))) {
      findings.push({
        severity: 'major',
        file: pageFile,
        message: 'showcase page not found at apps/web/src/app/ui-kit/page.tsx',
        suggestion:
          'create the showcase page so every registered component has an anchored section.',
      });
      return gateFail(this.name, findings, Date.now() - start);
    }

    const source = await fs.readFile(pageFile, 'utf8');
    const ids = extractAnchorIds(source);

    if (ctx.manifests.length === 0) {
      ctx.logger.debug(
        'coverage-showcase: no manifests loaded — nothing to verify',
      );
      return gateOk(this.name, Date.now() - start);
    }

    const seen = new Set<string>();
    for (const record of ctx.manifests) {
      const component = record.component;
      const expected = anchorIdFor(component);
      if (expected.length === 0) {
        ctx.logger.debug(
          `coverage-showcase: skipping manifest with empty component name (source=${record.source ?? 'unknown'})`,
        );
        continue;
      }
      if (seen.has(expected)) continue;
      seen.add(expected);

      if (!ids.has(expected)) {
        findings.push({
          severity: 'major',
          file: pageFile,
          component,
          message: `showcase page is missing anchor id="${expected}" for ${component}`,
          suggestion: `add a <div id="${expected}"> (or <section id="${expected}">) wrapping the ${component} section in apps/web/src/app/ui-kit/page.tsx so deep links resolve.`,
        });
      }
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - start);
    }
    return gateFail(this.name, findings, Date.now() - start);
  }
}

export default CoverageShowcaseGate;
