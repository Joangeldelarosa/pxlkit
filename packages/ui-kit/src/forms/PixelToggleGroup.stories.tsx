// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelToggleGroup.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelToggleGroup';
import manifest from './PixelToggleGroup.manifest';
import * as examples from './PixelToggleGroup.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelToggleGroup',
  component: (Component as any).PixelToggleGroup ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelToggleGroup — generated stub.',
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
          {"Missing example 'default' for PixelToggleGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Multiple */
export const Multiple: Story = {
  name: 'Multiple',
  tags: ["example-multiple"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Multiple ?? (examples as any)['multiple']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'multiple')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'multiple' for PixelToggleGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Variants */
export const Variants: Story = {
  name: 'Variants',
  tags: ["example-variants"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Variants ?? (examples as any)['variants']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'variants')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'variants' for PixelToggleGroup."}
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
          {"Missing example 'sizes' for PixelToggleGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Roving focus */
export const RovingFocus: Story = {
  name: 'Roving focus',
  tags: ["example-roving-focus"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RovingFocus ?? (examples as any)['roving-focus']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'roving-focus')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'roving-focus' for PixelToggleGroup."}
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
          {"Missing example 'surfaces' for PixelToggleGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
