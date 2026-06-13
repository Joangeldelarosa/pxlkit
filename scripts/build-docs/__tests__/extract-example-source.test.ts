import { describe, it, expect } from 'vitest';
import {
  rewriteRelativeImports,
  dropUnusedReactImport,
  sliceThroughFirstExport,
  extractExportFunctions,
  toUsageSnippet,
  toUsageSource,
} from '../extract-example-source';

const SAMPLE = `import React from 'react';
import { PixelAreaChart } from './PixelAreaChart';
import { Trophy } from '@pxlkit/gamification';

const sample = [
  { x: 'Mon', y: 12 },
  { x: 'Tue', y: 18 },
];

export function Default() {
  return <PixelAreaChart data={sample} />;
}

export function Tones() {
  return (
    <div className="flex gap-4">
      <PixelAreaChart data={sample} tone="gold" />
    </div>
  );
}
`;

describe('rewriteRelativeImports', () => {
  it('rewrites ./ and ../ specifiers to the package name, leaves packages alone', () => {
    const out = rewriteRelativeImports(SAMPLE);
    expect(out).toContain("from '@pxlkit/ui-kit';");
    expect(out).not.toContain("from './PixelAreaChart'");
    expect(out).toContain("from '@pxlkit/gamification';");
  });

  it('handles ../category/Component paths', () => {
    const out = rewriteRelativeImports("import { PxlKitButton } from '../actions';\n");
    expect(out).toBe("import { PxlKitButton } from '@pxlkit/ui-kit';\n");
  });
});

describe('dropUnusedReactImport', () => {
  it('drops a bare unused React default import', () => {
    expect(dropUnusedReactImport(SAMPLE)).not.toMatch(/^import React from 'react';$/m);
  });

  it('keeps React when used as a value', () => {
    const src = "import React from 'react';\nexport function X() { return React.createElement('i'); }\n";
    expect(dropUnusedReactImport(src)).toContain("import React from 'react';");
  });

  it('preserves named hooks when combined with the default import', () => {
    const src = "import React, { useState } from 'react';\nexport function X() { const [a] = useState(0); return <i>{a}</i>; }\n";
    const out = dropUnusedReactImport(src);
    expect(out).toContain("import { useState } from 'react';");
    expect(out).not.toMatch(/React,/);
  });
});

describe('sliceThroughFirstExport', () => {
  it('returns preamble plus only the first export function', () => {
    const out = sliceThroughFirstExport(SAMPLE);
    expect(out).toContain('const sample');
    expect(out).toContain('export function Default()');
    expect(out).not.toContain('export function Tones');
  });

  it('is not fooled by braces inside strings, templates, or comments', () => {
    const tricky = `export function Default() {
  // a comment with a brace }
  const s = "}}";
  const t = \`}\${'}'}\`;
  return <i title={'}'} />;
}

export function Second() { return null; }
`;
    const out = sliceThroughFirstExport(tricky);
    expect(out).toContain("title={'}'}");
    expect(out).not.toContain('Second');
  });

  it('returns null when no export function exists', () => {
    expect(sliceThroughFirstExport('const x = 1;\n')).toBeNull();
  });
});

describe('toUsageSnippet / toUsageSource', () => {
  it('produces a consumer-ready snippet: package import, no React import, Default only', () => {
    const snippet = toUsageSnippet(SAMPLE);
    expect(snippet).toContain("import { PixelAreaChart } from '@pxlkit/ui-kit';");
    expect(snippet).not.toContain("from './");
    expect(snippet).not.toMatch(/^import React from 'react';$/m);
    expect(snippet).toContain('export function Default()');
    expect(snippet).not.toContain('Tones');
  });

  it('full usage source keeps every example', () => {
    const full = toUsageSource(SAMPLE);
    expect(full).toContain('export function Default()');
    expect(full).toContain('export function Tones()');
  });
});

describe('extractExportFunctions', () => {
  it('extracts every export function verbatim, keyed by name', () => {
    const out = extractExportFunctions(SAMPLE);
    expect(Object.keys(out)).toEqual(['Default', 'Tones']);
    expect(out.Default).toContain('return <PixelAreaChart data={sample} />;');
    expect(out.Tones).toContain('tone="gold"');
    expect(out.Default).not.toContain('Tones');
  });

  it('survives braces in strings inside any block', () => {
    const src = 'export function A() {\n  return <i title={"}"} />;\n}\n\nexport function B() {\n  return null;\n}\n';
    const out = extractExportFunctions(src);
    expect(Object.keys(out)).toEqual(['A', 'B']);
  });
});
