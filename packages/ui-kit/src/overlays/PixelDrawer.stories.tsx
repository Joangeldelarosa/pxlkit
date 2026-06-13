// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelDrawer.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelDrawer';
import manifest from './PixelDrawer.manifest';
import * as examples from './PixelDrawer.examples';

const meta: Meta = {
  title: 'UI Kit / Overlays / PixelDrawer',
  component: (Component as any).PixelDrawer ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlays"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelDrawer — generated stub.',
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
          {"Missing example 'default' for PixelDrawer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Left side, large */
export const LeftSide: Story = {
  name: 'Left side, large',
  tags: ["example-left-side"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LeftSide ?? (examples as any)['left-side']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'left-side')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'left-side' for PixelDrawer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Bottom sheet */
export const BottomSheet: Story = {
  name: 'Bottom sheet',
  tags: ["example-bottom-sheet"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).BottomSheet ?? (examples as any)['bottom-sheet']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'bottom-sheet')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'bottom-sheet' for PixelDrawer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
