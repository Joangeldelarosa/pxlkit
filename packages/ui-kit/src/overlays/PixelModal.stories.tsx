// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelModal.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelModal';
import manifest from './PixelModal.manifest';
import * as examples from './PixelModal.examples';

const meta: Meta = {
  title: 'UI Kit / Overlays / PixelModal',
  component: (Component as any).PixelModal ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlays"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelModal — generated stub.',
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
          {"Missing example 'default' for PixelModal."}
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
          {"Missing example 'sizes' for PixelModal."}
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
          {"Missing example 'surfaces' for PixelModal."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With description */
export const WithDescription: Story = {
  name: 'With description',
  tags: ["example-with-description"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithDescription ?? (examples as any)['with-description']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-description')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-description' for PixelModal."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With footer */
export const WithFooter: Story = {
  name: 'With footer',
  tags: ["example-with-footer"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithFooter ?? (examples as any)['with-footer']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-footer')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-footer' for PixelModal."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Async close */
export const AsyncClose: Story = {
  name: 'Async close',
  tags: ["example-async-close"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsyncClose ?? (examples as any)['async-close']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'async-close')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'async-close' for PixelModal."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom close label */
export const CustomCloseLabel: Story = {
  name: 'Custom close label',
  tags: ["example-custom-close-label"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomCloseLabel ?? (examples as any)['custom-close-label']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-close-label')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-close-label' for PixelModal."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
