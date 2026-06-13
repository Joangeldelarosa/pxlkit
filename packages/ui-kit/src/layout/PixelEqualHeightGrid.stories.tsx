// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelEqualHeightGrid.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelEqualHeightGrid';
import manifest from './PixelEqualHeightGrid.manifest';
import * as examples from './PixelEqualHeightGrid.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelEqualHeightGrid',
  component: (Component as any).PixelEqualHeightGrid ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelEqualHeightGrid — generated stub.',
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
          {"Missing example 'default' for PixelEqualHeightGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Row Align Top */
export const RowAlignTop: Story = {
  name: 'Row Align Top',
  tags: ["example-row-align-top"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RowAlignTop ?? (examples as any)['row-align-top']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'row-align-top')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'row-align-top' for PixelEqualHeightGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Pixel Surface */
export const PixelSurface: Story = {
  name: 'Pixel Surface',
  tags: ["example-pixel-surface"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PixelSurface ?? (examples as any)['pixel-surface']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'pixel-surface')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'pixel-surface' for PixelEqualHeightGrid."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
