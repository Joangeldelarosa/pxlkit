// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelRibbon.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelRibbon';
import manifest from './PixelRibbon.manifest';
import * as examples from './PixelRibbon.examples';

const meta: Meta = {
  title: 'UI Kit / Cards / PixelRibbon',
  component: (Component as any).PixelRibbon ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-cards"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelRibbon — generated stub.',
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
          {"Missing example 'default' for PixelRibbon."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Corner tilted */
export const CornerTilted: Story = {
  name: 'Corner tilted',
  tags: ["example-corner-tilted"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CornerTilted ?? (examples as any)['corner-tilted']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'corner-tilted')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'corner-tilted' for PixelRibbon."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Tones */
export const Tones: Story = {
  name: 'Tones',
  tags: ["example-tones"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Tones ?? (examples as any)['tones']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'tones')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'tones' for PixelRibbon."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Position left */
export const PositionLeft: Story = {
  name: 'Position left',
  tags: ["example-position-left"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PositionLeft ?? (examples as any)['position-left']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'position-left')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'position-left' for PixelRibbon."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
