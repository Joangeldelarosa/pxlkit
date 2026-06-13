// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelCommand.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelCommand';
import manifest from './PixelCommand.manifest';
import * as examples from './PixelCommand.examples';

const meta: Meta = {
  title: 'UI Kit / Overlays / PixelCommand',
  component: (Component as any).PixelCommand ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlays"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelCommand — generated stub.',
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
          {"Missing example 'default' for PixelCommand."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom shortcut */
export const WithCustomShortcut: Story = {
  name: 'Custom shortcut',
  tags: ["example-with-custom-shortcut"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithCustomShortcut ?? (examples as any)['with-custom-shortcut']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-custom-shortcut')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-custom-shortcut' for PixelCommand."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Linear surface */
export const LinearSurface: Story = {
  name: 'Linear surface',
  tags: ["example-linear-surface"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).LinearSurface ?? (examples as any)['linear-surface']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'linear-surface')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'linear-surface' for PixelCommand."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
