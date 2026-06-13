// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelProgress.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelProgress';
import manifest from './PixelProgress.manifest';
import * as examples from './PixelProgress.examples';

const meta: Meta = {
  title: 'UI Kit / Feedback / PixelProgress',
  component: (Component as any).PixelProgress ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-feedback"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelProgress — generated stub.',
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
          {"Missing example 'default' for PixelProgress."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Tones */
export const Tones: Story = {
  name: 'Tones',
  tags: ["example-tones"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Tones ?? (examples as any)['tones']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'tones')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'tones' for PixelProgress."}
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
          {"Missing example 'surfaces' for PixelProgress."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Without value */
export const WithoutValue: Story = {
  name: 'Without value',
  tags: ["example-without-value"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithoutValue ?? (examples as any)['without-value']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'without-value')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'without-value' for PixelProgress."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Without label */
export const WithoutLabel: Story = {
  name: 'Without label',
  tags: ["example-without-label"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithoutLabel ?? (examples as any)['without-label']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'without-label')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'without-label' for PixelProgress."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Indeterminate */
export const Indeterminate: Story = {
  name: 'Indeterminate',
  tags: ["example-indeterminate"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Indeterminate ?? (examples as any)['indeterminate']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'indeterminate')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'indeterminate' for PixelProgress."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Clamped */
export const Clamped: Story = {
  name: 'Clamped',
  tags: ["example-clamped"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Clamped ?? (examples as any)['clamped']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'clamped')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'clamped' for PixelProgress."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Steps */
export const Steps: Story = {
  name: 'Steps',
  tags: ["example-steps"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Steps ?? (examples as any)['steps']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'steps')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'steps' for PixelProgress."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
