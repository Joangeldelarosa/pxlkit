import { describe, expect, it, vi } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { ExamplesRenderGate, type RenderProbe } from '../../gates/10-examples-render.js';
import type { AuditContext, ManifestRecord } from '../../_lib/load-context.js';

interface MockLoggerCalls {
  info: string[];
  warn: string[];
  error: string[];
  debug: string[];
}

function createMockLogger(): { logger: AuditContext['logger']; calls: MockLoggerCalls } {
  const calls: MockLoggerCalls = { info: [], warn: [], error: [], debug: [] };
  return {
    calls,
    logger: {
      info: (m) => calls.info.push(m),
      warn: (m) => calls.warn.push(m),
      error: (m) => calls.error.push(m),
      debug: (m) => calls.debug.push(m),
    },
  };
}

function makeContext(manifests: ManifestRecord[]): AuditContext {
  const { logger } = createMockLogger();
  return {
    repoRoot: '/tmp/pxlkit',
    manifests,
    uiKitSrcDir: '/tmp/pxlkit/packages/ui-kit/src',
    appsWebSrcDir: '/tmp/pxlkit/apps/web/src',
    tokensFile: '/tmp/pxlkit/packages/ui-kit/src/tokens.ts',
    registryFile: '/tmp/pxlkit/packages/ui-kit/src/registry.ts',
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger,
  };
}

const Good = (): ReactElement => createElement('div', null, 'ok');
const ThrowsRender = (): ReactElement => {
  throw new Error('boom');
};

describe('ExamplesRenderGate', () => {
  it('passes when there are no manifests', async () => {
    const gate = new ExamplesRenderGate();
    const result = await gate.run(makeContext([]));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.name).toBe('examples-render');
    expect(typeof result.duration_ms).toBe('number');
  });

  it('passes when every example renders without throwing', async () => {
    const probe: RenderProbe = { render: vi.fn() };
    const gate = new ExamplesRenderGate({ renderProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Button',
        file: 'packages/ui-kit/src/actions.tsx',
        examples: [
          { id: 'primary', label: 'Primary', Component: Good },
          { id: 'secondary', label: 'Secondary', Component: Good },
        ],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(probe.render).toHaveBeenCalledTimes(2);
  });

  it('fails (blocker) when an example throws during render', async () => {
    const probe: RenderProbe = {
      render: vi.fn((node: ReactElement) => {
        const fn = (node as unknown as { type: () => ReactElement }).type;
        fn();
      }),
    };
    const gate = new ExamplesRenderGate({ renderProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Modal',
        file: 'packages/ui-kit/src/overlay.tsx',
        examples: [
          { id: 'ok', label: 'OK', Component: Good },
          { id: 'broken', label: 'Broken', Component: ThrowsRender },
        ],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('blocker');
    expect(finding.component).toBe('Modal');
    expect(finding.file).toBe('packages/ui-kit/src/overlay.tsx');
    expect(finding.message).toMatch(/broken/);
    expect(finding.message).toMatch(/boom/);
    expect(finding.suggestion).toBeDefined();
  });

  it('flags examples that lack a Component function as blocker', async () => {
    const probe: RenderProbe = { render: vi.fn() };
    const gate = new ExamplesRenderGate({ renderProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Card',
        examples: [{ id: 'missing', label: 'Missing', Component: undefined }],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toMatch(/missing a Component/);
    expect(probe.render).not.toHaveBeenCalled();
  });

  it('skips manifests without examples without producing findings', async () => {
    const probe: RenderProbe = { render: vi.fn() };
    const gate = new ExamplesRenderGate({ renderProbe: probe });
    const manifests: ManifestRecord[] = [
      { component: 'Quiet', examples: [] },
      { component: 'AlsoQuiet' },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(probe.render).not.toHaveBeenCalled();
  });

  it('exposes static metadata expected by the audit runner', () => {
    const gate = new ExamplesRenderGate();
    expect(gate.id).toBe(10);
    expect(gate.name).toBe('examples-render');
    expect(gate.description).toMatch(/render/i);
  });
});
