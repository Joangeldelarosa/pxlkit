// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelAccordion.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelAccordion';
import manifest from './PixelAccordion.manifest';
import * as examples from './PixelAccordion.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelAccordion',
  component: (Component as any).PixelAccordion ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelAccordion — generated stub.',
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
          {"Missing example 'default' for PixelAccordion."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Collapsed by default */
export const CollapsedByDefault: Story = {
  name: 'Collapsed by default',
  tags: ["example-collapsed-by-default"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CollapsedByDefault ?? (examples as any)['collapsed-by-default']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'collapsed-by-default')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'collapsed-by-default' for PixelAccordion."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Allow multiple */
export const AllowMultiple: Story = {
  name: 'Allow multiple',
  tags: ["example-allow-multiple"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AllowMultiple ?? (examples as any)['allow-multiple']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'allow-multiple')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'allow-multiple' for PixelAccordion."}
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
          {"Missing example 'surfaces' for PixelAccordion."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Rich content */
export const RichContent: Story = {
  name: 'Rich content',
  tags: ["example-rich-content"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).RichContent ?? (examples as any)['rich-content']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'rich-content')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'rich-content' for PixelAccordion."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
