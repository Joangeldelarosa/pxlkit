import { performance } from 'node:perf_hooks';
import { createElement, type ComponentType, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
  type GateSeverity,
} from '../_lib/gate-base.js';

interface RawExampleLike {
  id?: unknown;
  label?: unknown;
  Component?: unknown;
}

interface NormalizedExample {
  index: number;
  id: string;
  label: string;
  Component: ComponentType | null;
}

interface ManifestLike {
  component: string;
  file?: string;
  examples?: unknown;
}

function normalizeExamples(examples: unknown): NormalizedExample[] {
  if (!Array.isArray(examples)) return [];
  return examples.map((raw, index): NormalizedExample => {
    const ex = (raw ?? {}) as RawExampleLike;
    const id = typeof ex.id === 'string' && ex.id.length > 0 ? ex.id : `example-${index}`;
    const label = typeof ex.label === 'string' && ex.label.length > 0 ? ex.label : id;
    const Component = typeof ex.Component === 'function' ? (ex.Component as ComponentType) : null;
    return { index, id, label, Component };
  });
}

function manifestExamples(manifest: ManifestLike): NormalizedExample[] {
  const direct = normalizeExamples(manifest.examples);
  if (direct.length > 0) return direct;
  const recordExamples = (manifest as unknown as { props?: unknown }).props;
  if (recordExamples && typeof recordExamples === 'object' && 'examples' in (recordExamples as object)) {
    return normalizeExamples((recordExamples as { examples?: unknown }).examples);
  }
  return [];
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const first = err.stack?.split('\n').slice(0, 3).join(' | ');
    return first ?? err.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export type AxeImpact = 'minor' | 'moderate' | 'serious' | 'critical' | null | undefined;

export interface AxeNodeResultLike {
  html?: string;
  target?: unknown;
  failureSummary?: string;
}

export interface AxeViolationLike {
  id: string;
  impact?: AxeImpact;
  help?: string;
  helpUrl?: string;
  description?: string;
  nodes?: AxeNodeResultLike[];
}

export interface AxeResultsLike {
  violations: AxeViolationLike[];
}

export interface AxeProbe {
  analyze(html: string): Promise<AxeResultsLike>;
}

interface JsdomCtor {
  new (html: string, options?: unknown): {
    window: { document: Document };
  };
}

let cachedAxeProbe: AxeProbe | null = null;

async function loadDefaultAxeProbe(): Promise<AxeProbe> {
  if (cachedAxeProbe) return cachedAxeProbe;
  const jsdomSpecifier = 'jsdom';
  const axeSpecifier = 'axe-core';
  const [jsdomMod, axeMod] = await Promise.all([
    import(jsdomSpecifier) as Promise<unknown>,
    import(axeSpecifier) as Promise<unknown>,
  ]);
  const JSDOM = (jsdomMod as { JSDOM: JsdomCtor }).JSDOM;
  const axe =
    ((axeMod as { default?: unknown }).default ?? axeMod) as {
      run: (ctx: unknown) => Promise<AxeResultsLike>;
    };
  cachedAxeProbe = {
    async analyze(html: string): Promise<AxeResultsLike> {
      const dom = new JSDOM(
        `<!doctype html><html><body><div id="pxlkit-axe-root">${html}</div></body></html>`,
      );
      const root = dom.window.document.getElementById('pxlkit-axe-root');
      const results = await axe.run(root ?? dom.window.document);
      return { violations: results.violations ?? [] };
    },
  };
  return cachedAxeProbe;
}

function severityForImpact(impact: AxeImpact): GateSeverity {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'blocker';
    case 'moderate':
      return 'major';
    case 'minor':
      return 'minor';
    default:
      return 'minor';
  }
}

function formatTarget(target: unknown): string {
  if (Array.isArray(target)) {
    return target.map((t) => (typeof t === 'string' ? t : JSON.stringify(t))).join(' ');
  }
  if (typeof target === 'string') return target;
  return '';
}

function summarizeViolation(v: AxeViolationLike): string {
  const node = v.nodes && v.nodes.length > 0 ? v.nodes[0] : undefined;
  const target = node ? formatTarget(node.target) : '';
  const help = v.help ?? v.description ?? v.id;
  const head = `[${v.id}${v.impact ? ` · ${v.impact}` : ''}] ${help}`;
  return target ? `${head} (target: ${target})` : head;
}

function suggestionForViolation(v: AxeViolationLike): string {
  if (v.helpUrl) {
    return `See ${v.helpUrl} and fix the example so axe-core reports no violations of rule "${v.id}".`;
  }
  return `Fix the example so axe-core reports no violations of rule "${v.id}".`;
}

export interface A11yAxeGateOptions {
  axeProbe?: AxeProbe;
}

export class A11yAxeGate extends Gate {
  readonly id = 11;
  readonly name = 'a11y-axe';
  readonly description =
    'For each example, render to JSDOM and run axe-core (jest-axe-style). Blocker on 0 violations exceeded, major for serious/critical only.';

  private probe: AxeProbe | null;

  constructor(options: A11yAxeGateOptions = {}) {
    super();
    this.probe = options.axeProbe ?? null;
  }

  private async getProbe(): Promise<AxeProbe> {
    if (!this.probe) {
      this.probe = await loadDefaultAxeProbe();
    }
    return this.probe;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = performance.now();
    const findings: GateFinding[] = [];

    const manifests = ctx.manifests as unknown as ManifestLike[];
    let examplesSeen = 0;
    let probe: AxeProbe | null = null;

    for (const manifest of manifests) {
      const componentName =
        typeof manifest.component === 'string' && manifest.component.length > 0
          ? manifest.component
          : '<unknown>';
      const file = typeof manifest.file === 'string' ? manifest.file : undefined;
      const examples = manifestExamples(manifest);

      if (examples.length === 0) {
        ctx.logger.debug(`a11y-axe: ${componentName} has no examples — skipping`);
        continue;
      }

      for (const example of examples) {
        examplesSeen += 1;
        if (!example.Component) {
          findings.push({
            severity: 'blocker',
            file,
            component: componentName,
            message: `Example "${example.id}" (${example.label}) is missing a Component function.`,
            suggestion:
              'Ensure the manifest example exports a renderable React component as `Component`.',
          });
          continue;
        }

        let html: string;
        try {
          const node: ReactElement = createElement(example.Component);
          html = renderToString(node);
        } catch (err) {
          findings.push({
            severity: 'blocker',
            file,
            component: componentName,
            message: `Example "${example.id}" (${example.label}) threw during render: ${describeError(err)}`,
            suggestion:
              'Reproduce locally with `npm run audit:coherence --workspace=@pxlkit/ui-kit` and fix the runtime error before publishing.',
          });
          continue;
        }

        try {
          if (!probe) probe = await this.getProbe();
          const results = await probe.analyze(html);
          const violations = Array.isArray(results.violations) ? results.violations : [];
          for (const v of violations) {
            findings.push({
              severity: severityForImpact(v.impact),
              file,
              component: componentName,
              message: `Example "${example.id}" (${example.label}) — ${summarizeViolation(v)}`,
              suggestion: suggestionForViolation(v),
            });
          }
        } catch (err) {
          findings.push({
            severity: 'major',
            file,
            component: componentName,
            message: `Example "${example.id}" (${example.label}) failed axe-core analysis: ${describeError(err)}`,
            suggestion:
              'Investigate the axe-core/JSDOM probe error; ensure the example renders valid HTML.',
          });
        }
      }
    }

    const duration_ms = Math.round(performance.now() - started);
    ctx.logger.debug(
      `a11y-axe: scanned ${examplesSeen} example(s) across ${manifests.length} manifest(s) in ${duration_ms}ms`,
    );

    if (findings.length === 0) {
      return gateOk(this.name, duration_ms);
    }
    return gateFail(this.name, findings, duration_ms);
  }
}

export default A11yAxeGate;
