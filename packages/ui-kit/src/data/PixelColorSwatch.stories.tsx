// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelColorSwatch.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelColorSwatch';
import manifest from './PixelColorSwatch.manifest';
import * as examples from './PixelColorSwatch.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelColorSwatch',
  component: (Component as any).PixelColorSwatch ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelColorSwatch — generated stub.',
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
          {"Missing example 'default' for PixelColorSwatch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Palette */
export const Palette: Story = {
  name: 'Palette',
  tags: ["example-palette"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Palette ?? (examples as any)['palette']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'palette')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'palette' for PixelColorSwatch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Surfaces */
export const Surfaces: Story = {
  name: 'Surfaces',
  tags: ["example-surfaces"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Surfaces ?? (examples as any)['surfaces']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'surfaces')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'surfaces' for PixelColorSwatch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Surface Tokens */
export const SurfaceTokens: Story = {
  name: 'Surface Tokens',
  tags: ["example-surface-tokens"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SurfaceTokens ?? (examples as any)['surface-tokens']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'surface-tokens')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'surface-tokens' for PixelColorSwatch."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
