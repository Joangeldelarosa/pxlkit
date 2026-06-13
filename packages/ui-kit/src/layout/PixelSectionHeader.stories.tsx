// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSectionHeader.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSectionHeader';
import manifest from './PixelSectionHeader.manifest';
import * as examples from './PixelSectionHeader.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelSectionHeader',
  component: (Component as any).PixelSectionHeader ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSectionHeader — generated stub.',
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
          {"Missing example 'default' for PixelSectionHeader."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Centered */
export const Centered: Story = {
  name: 'Centered',
  tags: ["example-centered"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Centered ?? (examples as any)['centered']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'centered')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'centered' for PixelSectionHeader."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Actions */
export const WithActions: Story = {
  name: 'With Actions',
  tags: ["example-with-actions"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithActions ?? (examples as any)['with-actions']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-actions')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-actions' for PixelSectionHeader."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Large Hero */
export const LargeHero: Story = {
  name: 'Large Hero',
  tags: ["example-large-hero"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LargeHero ?? (examples as any)['large-hero']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'large-hero')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'large-hero' for PixelSectionHeader."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
