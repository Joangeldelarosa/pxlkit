// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelStepper.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelStepper';
import manifest from './PixelStepper.manifest';
import * as examples from './PixelStepper.examples';

const meta: Meta = {
  title: 'UI Kit / Navigation / PixelStepper',
  component: (Component as any).PixelStepper ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-navigation"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelStepper — generated stub.',
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
          {"Missing example 'default' for PixelStepper."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Interactive */
export const Interactive: Story = {
  name: 'Interactive',
  tags: ["example-interactive"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Interactive ?? (examples as any)['interactive']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'interactive')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'interactive' for PixelStepper."}
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
          {"Missing example 'vertical' for PixelStepper."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** States */
export const States: Story = {
  name: 'States',
  tags: ["example-states"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).States ?? (examples as any)['states']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'states')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'states' for PixelStepper."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Sizes */
export const Sizes: Story = {
  name: 'Sizes',
  tags: ["example-sizes"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Sizes ?? (examples as any)['sizes']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'sizes')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'sizes' for PixelStepper."}
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
          {"Missing example 'surfaces' for PixelStepper."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Allow next steps */
export const AllowNextStepsSelect: Story = {
  name: 'Allow next steps',
  tags: ["example-allow-next-steps-select"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AllowNextStepsSelect ?? (examples as any)['allow-next-steps-select']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'allow-next-steps-select')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'allow-next-steps-select' for PixelStepper."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
