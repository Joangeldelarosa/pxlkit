// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PxlKitLocaleProvider.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PxlKitLocaleProvider';
import manifest from './PxlKitLocaleProvider.manifest';
import * as examples from './PxlKitLocaleProvider.examples';

const meta: Meta = {
  title: 'UI Kit / Overlay Foundation / PxlKitLocaleProvider',
  component: (Component as any).PxlKitLocaleProvider ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlay-foundation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PxlKitLocaleProvider — generated stub.',
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
          {"Missing example 'default' for PxlKitLocaleProvider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Turkish */
export const Turkish: Story = {
  name: 'Turkish',
  tags: ["example-turkish"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Turkish ?? (examples as any)['turkish']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'turkish')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'turkish' for PxlKitLocaleProvider."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
