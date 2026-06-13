// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PxlKitSurfaceProvider.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PxlKitSurfaceProvider';
import manifest from './PxlKitSurfaceProvider.manifest';
import * as examples from './PxlKitSurfaceProvider.examples';

const meta: Meta = {
  title: 'UI Kit / Overlay Foundation / PxlKitSurfaceProvider',
  component: (Component as any).PxlKitSurfaceProvider ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlay-foundation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PxlKitSurfaceProvider — generated stub.',
      },
    },
    manifest,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Default (Pixel) */
export const Default: Story = {
  name: 'Default (Pixel)',
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
          {"Missing example 'default' for PxlKitSurfaceProvider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Linear */
export const Linear: Story = {
  name: 'Linear',
  tags: ["example-linear"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Linear ?? (examples as any)['linear']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'linear')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'linear' for PxlKitSurfaceProvider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
