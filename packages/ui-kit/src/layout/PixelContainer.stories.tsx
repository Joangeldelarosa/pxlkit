// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelContainer.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelContainer';
import manifest from './PixelContainer.manifest';
import * as examples from './PixelContainer.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelContainer',
  component: (Component as any).PixelContainer ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelContainer — generated stub.',
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
          {"Missing example 'default' for PixelContainer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Narrow */
export const Narrow: Story = {
  name: 'Narrow',
  tags: ["example-narrow"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Narrow ?? (examples as any)['narrow']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'narrow')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'narrow' for PixelContainer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** As Main */
export const AsMain: Story = {
  name: 'As Main',
  tags: ["example-as-main"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsMain ?? (examples as any)['as-main']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'as-main')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'as-main' for PixelContainer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Prose Width */
export const ProseWidth: Story = {
  name: 'Prose Width',
  tags: ["example-prose-width"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ProseWidth ?? (examples as any)['prose-width']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'prose-width')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'prose-width' for PixelContainer."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
