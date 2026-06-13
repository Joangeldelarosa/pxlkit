// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelCombobox.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelCombobox';
import manifest from './PixelCombobox.manifest';
import * as examples from './PixelCombobox.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelCombobox',
  component: (Component as any).PixelCombobox ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelCombobox — generated stub.',
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
          {"Missing example 'default' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Uncontrolled */
export const Uncontrolled: Story = {
  name: 'Uncontrolled',
  tags: ["example-uncontrolled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Uncontrolled ?? (examples as any)['uncontrolled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'uncontrolled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'uncontrolled' for PixelCombobox."}
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
          {"Missing example 'controlled' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Grouped options */
export const Grouped: Story = {
  name: 'Grouped options',
  tags: ["example-grouped"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Grouped ?? (examples as any)['grouped']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'grouped')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'grouped' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Without search */
export const NotSearchable: Story = {
  name: 'Without search',
  tags: ["example-not-searchable"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).NotSearchable ?? (examples as any)['not-searchable']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'not-searchable')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'not-searchable' for PixelCombobox."}
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
          {"Missing example 'sizes' for PixelCombobox."}
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
          {"Missing example 'surfaces' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Disabled */
export const Disabled: Story = {
  name: 'Disabled',
  tags: ["example-disabled"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Disabled ?? (examples as any)['disabled']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'disabled')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'disabled' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With error */
export const WithError: Story = {
  name: 'With error',
  tags: ["example-with-error"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithError ?? (examples as any)['with-error']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-error')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-error' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With form name */
export const WithFormName: Story = {
  name: 'With form name',
  tags: ["example-with-form-name"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithFormName ?? (examples as any)['with-form-name']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-form-name')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-form-name' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Custom empty message */
export const CustomEmptyMessage: Story = {
  name: 'Custom empty message',
  tags: ["example-custom-empty-message"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CustomEmptyMessage ?? (examples as any)['custom-empty-message']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'custom-empty-message')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'custom-empty-message' for PixelCombobox."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
