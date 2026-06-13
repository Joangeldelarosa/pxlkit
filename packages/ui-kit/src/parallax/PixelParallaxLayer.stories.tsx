// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelParallaxLayer.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelParallaxLayer';
import manifest from './PixelParallaxLayer.manifest';
import * as examples from './PixelParallaxLayer.examples';

const meta: Meta = {
  title: 'UI Kit / Parallax / PixelParallaxLayer',
  component: (Component as any).PixelParallaxLayer ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-parallax"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelParallaxLayer — generated stub.',
      },
    },
    manifest,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Default (background) */
export const Default: Story = {
  name: 'Default (background)',
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
          {"Missing example 'default' for PixelParallaxLayer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Foreground (reverse) */
export const Foreground: Story = {
  name: 'Foreground (reverse)',
  tags: ["example-foreground"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Foreground ?? (examples as any)['foreground']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'foreground')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'foreground' for PixelParallaxLayer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Horizontal axis */
export const Horizontal: Story = {
  name: 'Horizontal axis',
  tags: ["example-horizontal"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Horizontal ?? (examples as any)['horizontal']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'horizontal')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'horizontal' for PixelParallaxLayer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
