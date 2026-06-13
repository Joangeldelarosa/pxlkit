// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelBento.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelBento';
import manifest from './PixelBento.manifest';
import * as examples from './PixelBento.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelBento',
  component: (Component as any).PixelBento ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelBento — generated stub.',
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
          {"Missing example 'default' for PixelBento."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Four Columns */
export const FourColumns: Story = {
  name: 'Four Columns',
  tags: ["example-four-columns"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).FourColumns ?? (examples as any)['four-columns']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'four-columns')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'four-columns' for PixelBento."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Cell Tones */
export const Cells: Story = {
  name: 'Cell Tones',
  tags: ["example-cells"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Cells ?? (examples as any)['cells']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'cells')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'cells' for PixelBento."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
