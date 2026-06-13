// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelSheet.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelSheet';
import manifest from './PixelSheet.manifest';
import * as examples from './PixelSheet.examples';

const meta: Meta = {
  title: 'UI Kit / Overlays / PixelSheet',
  component: (Component as any).PixelSheet ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlays"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelSheet — generated stub.',
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
          {"Missing example 'default' for PixelSheet."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With drag handle */
export const WithDragHandle: Story = {
  name: 'With drag handle',
  tags: ["example-with-drag-handle"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithDragHandle ?? (examples as any)['with-drag-handle']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-drag-handle')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-drag-handle' for PixelSheet."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Top side, full height */
export const TopFull: Story = {
  name: 'Top side, full height',
  tags: ["example-top-full"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).TopFull ?? (examples as any)['top-full']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'top-full')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'top-full' for PixelSheet."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
