// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelGrid.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelGrid';
import manifest from './PixelGrid.manifest';
import * as examples from './PixelGrid.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelGrid',
  component: (Component as any).PixelGrid ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelGrid — generated stub.',
      },
    },
    manifest,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Default */
export const Default: Story = {
  name: 'Default',
  tags: ["example-default"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Default ?? (examples as any)['default']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'default')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'default' for PixelGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Responsive Columns */
export const Responsive: Story = {
  name: 'Responsive Columns',
  tags: ["example-responsive"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Responsive ?? (examples as any)['responsive']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'responsive')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'responsive' for PixelGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Auto Fit */
export const AutoFit: Story = {
  name: 'Auto Fit',
  tags: ["example-auto-fit"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AutoFit ?? (examples as any)['auto-fit']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'auto-fit')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'auto-fit' for PixelGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Asymmetric Gaps */
export const AsymmetricGaps: Story = {
  name: 'Asymmetric Gaps',
  tags: ["example-asymmetric-gaps"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsymmetricGaps ?? (examples as any)['asymmetric-gaps']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'asymmetric-gaps')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'asymmetric-gaps' for PixelGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
