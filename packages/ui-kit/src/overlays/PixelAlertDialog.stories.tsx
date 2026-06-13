// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelAlertDialog.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelAlertDialog';
import manifest from './PixelAlertDialog.manifest';
import * as examples from './PixelAlertDialog.examples';

const meta: Meta = {
  title: 'UI Kit / Overlays / PixelAlertDialog',
  component: (Component as any).PixelAlertDialog ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlays"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelAlertDialog — generated stub.',
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
          {"Missing example 'default' for PixelAlertDialog."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Destructive */
export const Destructive: Story = {
  name: 'Destructive',
  tags: ["example-destructive"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Destructive ?? (examples as any)['destructive']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'destructive')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'destructive' for PixelAlertDialog."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Async Action */
export const AsyncAction: Story = {
  name: 'Async Action',
  tags: ["example-async-action"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsyncAction ?? (examples as any)['async-action']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'async-action')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'async-action' for PixelAlertDialog."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
