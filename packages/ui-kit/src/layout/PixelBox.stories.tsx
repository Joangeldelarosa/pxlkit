// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelBox.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelBox';
import manifest from './PixelBox.manifest';
import * as examples from './PixelBox.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelBox',
  component: (Component as any).PixelBox ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelBox — generated stub.',
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
          {"Missing example 'default' for PixelBox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Outline */
export const Outline: Story = {
  name: 'Outline',
  tags: ["example-outline"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Outline ?? (examples as any)['outline']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'outline')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'outline' for PixelBox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Soft */
export const Soft: Story = {
  name: 'Soft',
  tags: ["example-soft"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Soft ?? (examples as any)['soft']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'soft')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'soft' for PixelBox."}
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
          {"Missing example 'as-section' for PixelBox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
