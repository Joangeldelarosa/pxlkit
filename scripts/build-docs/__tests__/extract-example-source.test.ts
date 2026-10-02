import { describe, it, expect } from 'vitest';
import { selfContainedExamples } from '../extract-example-source';

const REACT = `import React, { useState } from 'react';
import { PixelAreaChart } from './PixelAreaChart';
import { PixelButton, PixelBadge } from '../actions';
import { Trophy } from '@pxlkit/gamification';
import type { Tone } from '../common';

const sample = [
  { x: 'Mon', y: 12 },
  { x: 'Tue', y: 18 },
];

const TONES: Tone[] = ['green', 'gold'];

interface ArrowProps { flip?: boolean }

function Arrow({ flip }: ArrowProps) {
  return <span aria-hidden="true">{flip ? '←' : '→'}</span>;
}

export function Default() {
  return <PixelAreaChart data={sample} />;
}

export function Tones() {
  return (
    <div className="flex gap-4">
      {TONES.map((tone) => <PixelAreaChart key={tone} data={sample} tone={tone} />)}
    </div>
  );
}

export function WithIcons() {
  const [count, setCount] = useState(0);
  return (
    <PixelButton iconLeft={<Arrow flip />} onClick={() => setCount(count + 1)}>
      <Trophy /> {count}
    </PixelButton>
  );
}

export function Counter() {
  const [count, setCount] = React.useState(0);
  return <PixelBadge onClick={() => setCount(count + 1)}>{count}</PixelBadge>;
}
`;

const ANGULAR = `import { Component, signal, computed } from '@angular/core';
import { PixelSelect, PixelButton, type Option } from '@pxlkit/ui-kit-angular';

const FRUITS: Option[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'pear', label: 'Pear' },
];

@Component({
  selector: 'example-shout',
  imports: [PixelButton],
  template: '<pxl-button>Shout</pxl-button>',
})
class Shout {}

@Component({
  selector: 'example-controlled',
  imports: [PixelSelect],
  template: '<pxl-select [options]="fruits" [(value)]="value" />',
})
export class Controlled {
  readonly fruits = FRUITS;
  readonly value = signal('apple');
}

@Component({
  selector: 'example-with-shout',
  imports: [Shout],
  template: '<example-shout />',
})
export class WithShout {
  readonly upper = computed(() => 'SHOUT');
}
`;

describe('selfContainedExamples — React examples', () => {
  const examples = selfContainedExamples(REACT, { kind: 'tsx', packageName: '@pxlkit/ui-kit' });

  it('keys every top-level declaration by its name', () => {
    expect(Object.keys(examples)).toEqual(['sample', 'TONES', 'ArrowProps', 'Arrow', 'Default', 'Tones', 'WithIcons', 'Counter']);
  });

  it('keeps only the imports an example uses, relative ones rewritten to the package', () => {
    expect(examples.Default).toBe(
      [
        "import { PixelAreaChart } from '@pxlkit/ui-kit';",
        '',
        'const sample = [',
        "  { x: 'Mon', y: 12 },",
        "  { x: 'Tue', y: 18 },",
        '];',
        '',
        'export function Default() {',
        '  return <PixelAreaChart data={sample} />;',
        '}',
        '',
      ].join('\n'),
    );
  });

  it('carries the helpers an example reaches, transitively and in source order', () => {
    const snippet = examples.WithIcons!;
    expect(snippet).toContain("import { useState } from 'react';");
    expect(snippet).toContain("import { PixelButton } from '@pxlkit/ui-kit';");
    expect(snippet).toContain("import { Trophy } from '@pxlkit/gamification';");
    // Arrow, and the props type Arrow reads.
    expect(snippet.indexOf('interface ArrowProps')).toBeGreaterThan(-1);
    expect(snippet.indexOf('interface ArrowProps')).toBeLessThan(snippet.indexOf('function Arrow('));
    expect(snippet.indexOf('function Arrow(')).toBeLessThan(snippet.indexOf('export function WithIcons'));
    // Nothing it does not use.
    expect(snippet).not.toContain('PixelBadge');
    expect(snippet).not.toContain('PixelAreaChart');
    expect(snippet).not.toContain('const sample');
    expect(snippet).not.toMatch(/^import React/m);
  });

  it('keeps a type-only import as one, for the helpers whose types read it', () => {
    expect(examples.Tones).toContain("import type { Tone } from '@pxlkit/ui-kit';");
    expect(examples.Tones).toContain('const TONES: Tone[]');
    expect(examples.Tones).toContain('const sample');
  });

  it('keeps the React default import only where React is read', () => {
    expect(examples.Counter).toContain("import React from 'react';");
    expect(examples.Counter).not.toContain('useState }');
    expect(examples.Default).not.toContain("from 'react'");
  });

  it('leaves the specifiers alone without a package name', () => {
    const raw = selfContainedExamples(REACT, { kind: 'tsx' });
    expect(raw.Default).toContain("import { PixelAreaChart } from './PixelAreaChart';");
  });

  it('does not count property names, attributes or members as reads', () => {
    const source = `import { label, onClick, data } from 'elsewhere';
export function X() {
  const value = { label: 1 };
  return <i onClick={() => value.label} data-x="1" />;
}
`;
    expect(selfContainedExamples(source, { kind: 'tsx' }).X).not.toContain('import');
  });
});

describe('selfContainedExamples — Angular examples', () => {
  const examples = selfContainedExamples(ANGULAR, { kind: 'ts' });

  it('keeps the decorator, the class and the data the class reads', () => {
    expect(examples.Controlled).toBe(
      [
        "import { Component, signal } from '@angular/core';",
        "import { PixelSelect, type Option } from '@pxlkit/ui-kit-angular';",
        '',
        'const FRUITS: Option[] = [',
        "  { value: 'apple', label: 'Apple' },",
        "  { value: 'pear', label: 'Pear' },",
        '];',
        '',
        '@Component({',
        "  selector: 'example-controlled',",
        '  imports: [PixelSelect],',
        `  template: '<pxl-select [options]="fruits" [(value)]="value" />',`,
        '})',
        'export class Controlled {',
        '  readonly fruits = FRUITS;',
        "  readonly value = signal('apple');",
        '}',
        '',
      ].join('\n'),
    );
  });

  it('carries the components an example imports from its own module', () => {
    const snippet = examples.WithShout!;
    expect(snippet).toContain("import { Component, computed } from '@angular/core';");
    expect(snippet).toContain("import { PixelButton } from '@pxlkit/ui-kit-angular';");
    expect(snippet.indexOf('class Shout {}')).toBeGreaterThan(-1);
    expect(snippet.indexOf('class Shout {}')).toBeLessThan(snippet.indexOf('export class WithShout'));
    expect(snippet).not.toContain('FRUITS');
    expect(snippet).not.toContain('signal');
  });
});
