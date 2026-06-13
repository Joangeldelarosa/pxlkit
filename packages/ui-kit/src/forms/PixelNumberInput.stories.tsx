// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelNumberInput.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelNumberInput';
import manifest from './PixelNumberInput.manifest';
import * as examples from './PixelNumberInput.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelNumberInput',
  component: (Component as any).PixelNumberInput ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelNumberInput — generated stub.',
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
          {"Missing example 'default' for PixelNumberInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Prefix & Suffix */
export const WithPrefixSuffix: Story = {
  name: 'With Prefix & Suffix',
  tags: ["example-with-prefix-suffix"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithPrefixSuffix ?? (examples as any)['with-prefix-suffix']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-prefix-suffix')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-prefix-suffix' for PixelNumberInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Thousands Separator */
export const ThousandsSeparator: Story = {
  name: 'Thousands Separator',
  tags: ["example-thousands-separator"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ThousandsSeparator ?? (examples as any)['thousands-separator']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'thousands-separator')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'thousands-separator' for PixelNumberInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Hide Controls */
export const HideControls: Story = {
  name: 'Hide Controls',
  tags: ["example-hide-controls"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).HideControls ?? (examples as any)['hide-controls']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'hide-controls')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'hide-controls' for PixelNumberInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Error */
export const WithError: Story = {
  name: 'With Error',
  tags: ["example-with-error"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithError ?? (examples as any)['with-error']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-error')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-error' for PixelNumberInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
