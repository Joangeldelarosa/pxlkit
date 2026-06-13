// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelBareTextarea.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelBareTextarea';
import manifest from './PixelBareTextarea.manifest';
import * as examples from './PixelBareTextarea.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelBareTextarea',
  component: (Component as any).PixelBareTextarea ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelBareTextarea — generated stub.',
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
          {"Missing example 'default' for PixelBareTextarea."}
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
          {"Missing example 'uncontrolled' for PixelBareTextarea."}
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
          {"Missing example 'controlled' for PixelBareTextarea."}
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
          {"Missing example 'disabled' for PixelBareTextarea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Read only */
export const ReadOnly: Story = {
  name: 'Read only',
  tags: ["example-read-only"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ReadOnly ?? (examples as any)['read-only']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'read-only')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'read-only' for PixelBareTextarea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With custom styling */
export const WithCustomStyling: Story = {
  name: 'With custom styling',
  tags: ["example-with-custom-styling"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithCustomStyling ?? (examples as any)['with-custom-styling']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-custom-styling')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-custom-styling' for PixelBareTextarea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With max length */
export const WithMaxLength: Story = {
  name: 'With max length',
  tags: ["example-with-max-length"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithMaxLength ?? (examples as any)['with-max-length']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-max-length')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-max-length' for PixelBareTextarea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Required */
export const Required: Story = {
  name: 'Required',
  tags: ["example-required"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Required ?? (examples as any)['required']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'required')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'required' for PixelBareTextarea."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
