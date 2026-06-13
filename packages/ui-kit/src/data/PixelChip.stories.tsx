// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelChip.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelChip';
import manifest from './PixelChip.manifest';
import * as examples from './PixelChip.examples';

const meta: Meta = {
  title: 'UI Kit / Data / PixelChip',
  component: (Component as any).PixelChip ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-data"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelChip — generated stub.',
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
          {"Missing example 'default' for PixelChip."}
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
          {"Missing example 'tones' for PixelChip."}
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
          {"Missing example 'sizes' for PixelChip."}
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
          {"Missing example 'variants' for PixelChip."}
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
          {"Missing example 'surfaces' for PixelChip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Icon */
export const WithIcon: Story = {
  name: 'With Icon',
  tags: ["example-with-icon"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithIcon ?? (examples as any)['with-icon']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-icon')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-icon' for PixelChip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Clickable */
export const Clickable: Story = {
  name: 'Clickable',
  tags: ["example-clickable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Clickable ?? (examples as any)['clickable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'clickable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'clickable' for PixelChip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Deletable */
export const Deletable: Story = {
  name: 'Deletable',
  tags: ["example-deletable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Deletable ?? (examples as any)['deletable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'deletable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'deletable' for PixelChip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Clickable + Deletable */
export const ClickableAndDeletable: Story = {
  name: 'Clickable + Deletable',
  tags: ["example-clickable-and-deletable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ClickableAndDeletable ?? (examples as any)['clickable-and-deletable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'clickable-and-deletable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'clickable-and-deletable' for PixelChip."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
