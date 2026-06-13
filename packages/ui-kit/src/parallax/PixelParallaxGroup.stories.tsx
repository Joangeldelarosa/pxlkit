// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelParallaxGroup.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelParallaxGroup';
import manifest from './PixelParallaxGroup.manifest';
import * as examples from './PixelParallaxGroup.examples';

const meta: Meta = {
  title: 'UI Kit / Parallax / PixelParallaxGroup',
  component: (Component as any).PixelParallaxGroup ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-parallax"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelParallaxGroup — generated stub.',
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
          {"Missing example 'default' for PixelParallaxGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** As Section */
export const AsSection: Story = {
  name: 'As Section',
  tags: ["example-as-section"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsSection ?? (examples as any)['as-section']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'as-section')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'as-section' for PixelParallaxGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
