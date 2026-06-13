// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelOTPInput.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelOTPInput';
import manifest from './PixelOTPInput.manifest';
import * as examples from './PixelOTPInput.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelOTPInput',
  component: (Component as any).PixelOTPInput ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelOTPInput — generated stub.',
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
          {"Missing example 'default' for PixelOTPInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** 4-digit Numeric */
export const Numeric4: Story = {
  name: '4-digit Numeric',
  tags: ["example-numeric-4"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Numeric4 ?? (examples as any)['numeric-4']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'numeric-4')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'numeric-4' for PixelOTPInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Alphanumeric */
export const Alphanumeric: Story = {
  name: 'Alphanumeric',
  tags: ["example-alphanumeric"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Alphanumeric ?? (examples as any)['alphanumeric']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'alphanumeric')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'alphanumeric' for PixelOTPInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Masked */
export const Masked: Story = {
  name: 'Masked',
  tags: ["example-masked"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Masked ?? (examples as any)['masked']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'masked')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'masked' for PixelOTPInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Separator */
export const WithSeparator: Story = {
  name: 'With Separator',
  tags: ["example-with-separator"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithSeparator ?? (examples as any)['with-separator']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-separator')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-separator' for PixelOTPInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
