// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelScrollArea.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelScrollArea';
import manifest from './PixelScrollArea.manifest';
import * as examples from './PixelScrollArea.examples';

const meta: Meta = {
  title: 'UI Kit / Layout / PixelScrollArea',
  component: (Component as any).PixelScrollArea ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-layout"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelScrollArea — generated stub.',
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
          {"Missing example 'default' for PixelScrollArea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Always Visible */
export const AlwaysVisible: Story = {
  name: 'Always Visible',
  tags: ["example-always-visible"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AlwaysVisible ?? (examples as any)['always-visible']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'always-visible')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'always-visible' for PixelScrollArea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom Scrollbar Size */
export const CustomScrollbarSize: Story = {
  name: 'Custom Scrollbar Size',
  tags: ["example-custom-scrollbar-size"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomScrollbarSize ?? (examples as any)['custom-scrollbar-size']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-scrollbar-size')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-scrollbar-size' for PixelScrollArea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
