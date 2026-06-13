// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSparkline.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSparkline';
import manifest from './PixelSparkline.manifest';
import * as examples from './PixelSparkline.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelSparkline',
  component: (Component as any).PixelSparkline ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSparkline — generated stub.',
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
          {"Missing example 'default' for PixelSparkline."}
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
          {"Missing example 'tones' for PixelSparkline."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Sizes */
export const Sizes: Story = {
  name: 'Sizes',
  tags: ["example-sizes"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Sizes ?? (examples as any)['sizes']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'sizes')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'sizes' for PixelSparkline."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Area */
export const WithArea: Story = {
  name: 'With Area',
  tags: ["example-with-area"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithArea ?? (examples as any)['with-area']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-area')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-area' for PixelSparkline."}
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
          {"Missing example 'surfaces' for PixelSparkline."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
