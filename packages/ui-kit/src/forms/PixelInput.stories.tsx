// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelInput.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelInput';
import manifest from './PixelInput.manifest';
import * as examples from './PixelInput.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelInput',
  component: (Component as any).PixelInput ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelInput — generated stub.',
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
          {"Missing example 'default' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Controlled */
export const Controlled: Story = {
  name: 'Controlled',
  tags: ["example-controlled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Controlled ?? (examples as any)['controlled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'controlled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'controlled' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Uncontrolled */
export const Uncontrolled: Story = {
  name: 'Uncontrolled',
  tags: ["example-uncontrolled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Uncontrolled ?? (examples as any)['uncontrolled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'uncontrolled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'uncontrolled' for PixelInput."}
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
          {"Missing example 'tones' for PixelInput."}
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
          {"Missing example 'sizes' for PixelInput."}
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
          {"Missing example 'surfaces' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Prefix & Suffix */
export const PrefixSuffix: Story = {
  name: 'Prefix & Suffix',
  tags: ["example-prefix-suffix"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PrefixSuffix ?? (examples as any)['prefix-suffix']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'prefix-suffix')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'prefix-suffix' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Joined Addons */
export const Addons: Story = {
  name: 'Joined Addons',
  tags: ["example-addons"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Addons ?? (examples as any)['addons']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'addons')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'addons' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Clearable */
export const Clearable: Story = {
  name: 'Clearable',
  tags: ["example-clearable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Clearable ?? (examples as any)['clearable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'clearable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'clearable' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Loading */
export const Loading: Story = {
  name: 'Loading',
  tags: ["example-loading"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Loading ?? (examples as any)['loading']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'loading')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'loading' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Disabled */
export const Disabled: Story = {
  name: 'Disabled',
  tags: ["example-disabled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Disabled ?? (examples as any)['disabled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'disabled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'disabled' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Error */
export const Error: Story = {
  name: 'With Error',
  tags: ["example-error"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Error ?? (examples as any)['error']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'error')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'error' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Character Count */
export const CharCount: Story = {
  name: 'Character Count',
  tags: ["example-char-count"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CharCount ?? (examples as any)['char-count']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'char-count')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'char-count' for PixelInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
