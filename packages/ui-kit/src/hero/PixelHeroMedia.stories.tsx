// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelHeroMedia.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelHeroMedia';
import manifest from './PixelHeroMedia.manifest';
import * as examples from './PixelHeroMedia.examples';

const meta: Meta = {
  title: 'UI Kit / Hero / PixelHeroMedia',
  component: (Component as any).PixelHeroMedia ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-hero"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelHeroMedia — generated stub.',
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
          {"Missing example 'default' for PixelHeroMedia."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Framed with caption */
export const Framed: Story = {
  name: 'Framed with caption',
  tags: ["example-framed"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Framed ?? (examples as any)['framed']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'framed')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'framed' for PixelHeroMedia."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Square (1:1) */
export const Square: Story = {
  name: 'Square (1:1)',
  tags: ["example-square"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Square ?? (examples as any)['square']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'square')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'square' for PixelHeroMedia."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
