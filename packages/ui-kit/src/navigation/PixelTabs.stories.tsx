// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelTabs.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelTabs';
import manifest from './PixelTabs.manifest';
import * as examples from './PixelTabs.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelTabs',
  component: (Component as any).PixelTabs ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelTabs — generated stub.',
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
          {"Missing example 'default' for PixelTabs."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Controlled */
export const Controlled: Story = {
  name: 'Controlled',
  tags: ["example-controlled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Controlled ?? (examples as any)['controlled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'controlled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'controlled' for PixelTabs."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Vertical */
export const Vertical: Story = {
  name: 'Vertical',
  tags: ["example-vertical"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Vertical ?? (examples as any)['vertical']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'vertical')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'vertical' for PixelTabs."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Manual activation */
export const ManualActivation: Story = {
  name: 'Manual activation',
  tags: ["example-manual-activation"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ManualActivation ?? (examples as any)['manual-activation']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'manual-activation')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'manual-activation' for PixelTabs."}
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
          {"Missing example 'surfaces' for PixelTabs."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Scrollable */
export const Scrollable: Story = {
  name: 'Scrollable',
  tags: ["example-scrollable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Scrollable ?? (examples as any)['scrollable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'scrollable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'scrollable' for PixelTabs."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Keep mounted */
export const KeepMounted: Story = {
  name: 'Keep mounted',
  tags: ["example-keep-mounted"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).KeepMounted ?? (examples as any)['keep-mounted']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'keep-mounted')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'keep-mounted' for PixelTabs."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Compositional */
export const Compositional: Story = {
  name: 'Compositional',
  tags: ["example-compositional"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Compositional ?? (examples as any)['compositional']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'compositional')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'compositional' for PixelTabs."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
