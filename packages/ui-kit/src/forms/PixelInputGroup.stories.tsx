// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelInputGroup.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelInputGroup';
import manifest from './PixelInputGroup.manifest';
import * as examples from './PixelInputGroup.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelInputGroup',
  component: (Component as any).PixelInputGroup ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelInputGroup — generated stub.',
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
          {"Missing example 'default' for PixelInputGroup."}
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
          {"Missing example 'sizes' for PixelInputGroup."}
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
          {"Missing example 'surfaces' for PixelInputGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Phone with Country Code */
export const PhoneWithCountryCode: Story = {
  name: 'Phone with Country Code',
  tags: ["example-phone-with-country-code"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PhoneWithCountryCode ?? (examples as any)['phone-with-country-code']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'phone-with-country-code')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'phone-with-country-code' for PixelInputGroup."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
