// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSidebar.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSidebar';
import manifest from './PixelSidebar.manifest';
import * as examples from './PixelSidebar.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelSidebar',
  component: (Component as any).PixelSidebar ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSidebar — generated stub.',
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
          {"Missing example 'default' for PixelSidebar."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Collapsible */
export const Collapsible: Story = {
  name: 'Collapsible',
  tags: ["example-collapsible"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Collapsible ?? (examples as any)['collapsible']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'collapsible')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'collapsible' for PixelSidebar."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Nested items */
export const Nested: Story = {
  name: 'Nested items',
  tags: ["example-nested"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Nested ?? (examples as any)['nested']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'nested')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'nested' for PixelSidebar."}
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
          {"Missing example 'with-footer' for PixelSidebar."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
