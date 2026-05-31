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
    const first = err.stack?.split('\n').slice(0, 4).join(' | ');
    return first ?? err.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export interface RenderProbe {
  render(node: ReactElement): void;
}

export const defaultRenderProbe: RenderProbe = {
  render(node: ReactElement): void {
    renderToString(node);
  },
};

export interface ExamplesRenderGateOptions {
  renderProbe?: RenderProbe;
}

export class ExamplesRenderGate extends Gate {
  readonly id = 10;
  readonly name = 'examples-render';
  readonly description =
    'For each example, attempt to render it via vitest + happy-dom and assert no thrown error. Blocker on render failure.';

  private readonly probe: RenderProbe;

  constructor(options: ExamplesRenderGateOptions = {}) {
    super();
    this.probe = options.renderProbe ?? defaultRenderProbe;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = performance.now();
    const findings: GateFinding[] = [];

    const manifests = ctx.manifests as unknown as ManifestLike[];
    let examplesSeen = 0;

    for (const manifest of manifests) {
      const componentName =
        typeof manifest.component === 'string' && manifest.component.length > 0
          ? manifest.component
          : '<unknown>';
      const file = typeof manifest.file === 'string' ? manifest.file : undefined;
      const examples = manifestExamples(manifest);

      if (examples.length === 0) {
        ctx.logger.debug(`examples-render: ${componentName} has no examples — skipping`);
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
        try {
          const node = createElement(example.Component);
          this.probe.render(node);
        } catch (err) {
          findings.push({
            severity: 'blocker',
            file,
            component: componentName,
            message: `Example "${example.id}" (${example.label}) threw during render: ${describeError(err)}`,
            suggestion:
              'Reproduce locally with `npm run audit:coherence --workspace=@pxlkit/ui-kit` and fix the runtime error in the example before publishing.',
          });
        }
      }
    }

    const duration_ms = Math.round(performance.now() - started);
    ctx.logger.debug(
      `examples-render: scanned ${examplesSeen} example(s) across ${manifests.length} manifest(s) in ${duration_ms}ms`,
    );

    if (findings.length === 0) {
      return gateOk(this.name, duration_ms);
    }
    return gateFail(this.name, findings, duration_ms);
  }
}

export default ExamplesRenderGate;
