import { describe, expect, it, vi } from 'vitest';
import { createElement, type ReactElement } from 'react';
import {
  A11yAxeGate,
  type AxeProbe,
  type AxeResultsLike,
} from '../../gates/11-a11y-axe.js';
import type { AuditContext, Logger, ManifestRecord } from '../../_lib/load-context.js';

function silentLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
}

function makeContext(manifests: ManifestRecord[]): AuditContext {
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
    logger: silentLogger(),
  };
}

const Good = (): ReactElement => createElement('div', null, 'ok');
const Throws = (): ReactElement => {
  throw new Error('boom');
};

function probeReturning(results: AxeResultsLike): AxeProbe {
  return { analyze: vi.fn(async () => results) };
}

function emptyResults(): AxeResultsLike {
  return { violations: [] };
}

describe('A11yAxeGate', () => {
  it('passes when there are no manifests', async () => {
    const probe = probeReturning(emptyResults());
    const gate = new A11yAxeGate({ axeProbe: probe });
    const result = await gate.run(makeContext([]));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.name).toBe('a11y-axe');
    expect(typeof result.duration_ms).toBe('number');
    expect(probe.analyze).not.toHaveBeenCalled();
  });

  it('passes when axe reports zero violations for every example', async () => {
    const probe = probeReturning(emptyResults());
    const gate = new A11yAxeGate({ axeProbe: probe });
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
    expect(probe.analyze).toHaveBeenCalledTimes(2);
  });

  it('classifies serious/critical violations as blocker and fails the gate', async () => {
    const probe = probeReturning({
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious',
          help: 'Elements must have sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/color-contrast',
          nodes: [{ html: '<span>x</span>', target: ['span'] }],
        },
        {
          id: 'image-alt',
          impact: 'critical',
          help: 'Images must have alternate text',
          nodes: [{ html: '<img>', target: ['img'] }],
        },
      ],
    });
    const gate = new A11yAxeGate({ axeProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Card',
        file: 'packages/ui-kit/src/card.tsx',
        examples: [{ id: 'default', label: 'Default', Component: Good }],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(2);
    expect(result.findings.every((f) => f.severity === 'blocker')).toBe(true);
    expect(result.findings[0].component).toBe('Card');
    expect(result.findings[0].file).toBe('packages/ui-kit/src/card.tsx');
    expect(result.findings[0].message).toMatch(/color-contrast/);
    expect(result.findings[0].suggestion).toMatch(/dequeuniversity/);
    expect(result.findings[1].message).toMatch(/image-alt/);
  });

  it('classifies moderate as major and minor as minor (gate still passes if only minor/no-blocker-no-major)', async () => {
    const probe = probeReturning({
      violations: [
        { id: 'landmark-one-main', impact: 'moderate', help: 'h' },
        { id: 'region', impact: 'minor', help: 'h' },
      ],
    });
    const gate = new A11yAxeGate({ axeProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Layout',
        examples: [{ id: 'a', label: 'A', Component: Good }],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.findings).toHaveLength(2);
    const bySeverity = Object.fromEntries(result.findings.map((f) => [f.severity, f]));
    expect(bySeverity.major).toBeDefined();
    expect(bySeverity.minor).toBeDefined();
    expect(result.passed).toBe(false);
  });

  it('flags examples that lack a Component function as blocker without invoking axe', async () => {
    const probe = probeReturning(emptyResults());
    const gate = new A11yAxeGate({ axeProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Modal',
        examples: [{ id: 'missing', label: 'Missing', Component: undefined }],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toMatch(/missing a Component/);
    expect(probe.analyze).not.toHaveBeenCalled();
  });

  it('reports a blocker when an example throws during render and skips axe for that example', async () => {
    const probe = probeReturning(emptyResults());
    const gate = new A11yAxeGate({ axeProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Broken',
        file: 'packages/ui-kit/src/broken.tsx',
        examples: [
          { id: 'ok', label: 'OK', Component: Good },
          { id: 'kaput', label: 'Kaput', Component: Throws },
        ],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(false);
    const blockers = result.findings.filter((f) => f.severity === 'blocker');
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toMatch(/threw during render/);
    expect(probe.analyze).toHaveBeenCalledTimes(1);
  });

  it('reports a major finding when the axe probe itself throws', async () => {
    const probe: AxeProbe = {
      analyze: vi.fn(async () => {
        throw new Error('axe blew up');
      }),
    };
    const gate = new A11yAxeGate({ axeProbe: probe });
    const manifests: ManifestRecord[] = [
      {
        component: 'Anything',
        examples: [{ id: 'a', label: 'A', Component: Good }],
      },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('major');
    expect(result.findings[0].message).toMatch(/axe blew up/);
  });

  it('skips manifests without examples without producing findings', async () => {
    const probe = probeReturning(emptyResults());
    const gate = new A11yAxeGate({ axeProbe: probe });
    const manifests: ManifestRecord[] = [
      { component: 'Quiet', examples: [] },
      { component: 'AlsoQuiet' },
    ];
    const result = await gate.run(makeContext(manifests));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(probe.analyze).not.toHaveBeenCalled();
  });

  it('exposes static metadata expected by the audit runner', () => {
    const gate = new A11yAxeGate();
    expect(gate.id).toBe(11);
    expect(gate.name).toBe('a11y-axe');
    expect(gate.description).toMatch(/axe/i);
  });
});
