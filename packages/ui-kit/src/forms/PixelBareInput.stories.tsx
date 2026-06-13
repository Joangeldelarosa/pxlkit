// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelBareInput.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelBareInput';
import manifest from './PixelBareInput.manifest';
import * as examples from './PixelBareInput.examples';

const meta: Meta = {
  title: 'UI Kit / Forms / PixelBareInput',
  component: (Component as any).PixelBareInput ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-forms"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelBareInput — generated stub.',
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
          {"Missing example 'default' for PixelBareInput."}
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
          {"Missing example 'uncontrolled' for PixelBareInput."}
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
          {"Missing example 'controlled' for PixelBareInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Email */
export const Email: Story = {
  name: 'Email',
  tags: ["example-email"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Email ?? (examples as any)['email']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'email')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'email' for PixelBareInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Password */
export const Password: Story = {
  name: 'Password',
  tags: ["example-password"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Password ?? (examples as any)['password']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'password')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'password' for PixelBareInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Number */
export const Number: Story = {
  name: 'Number',
  tags: ["example-number"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Number ?? (examples as any)['number']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'number')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'number' for PixelBareInput."}
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
          {"Missing example 'disabled' for PixelBareInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Read-only */
export const ReadOnly: Story = {
  name: 'Read-only',
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
          {"Missing example 'read-only' for PixelBareInput."}
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
          {"Missing example 'required' for PixelBareInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With ref */
export const WithRef: Story = {
  name: 'With ref',
  tags: ["example-with-ref"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithRef ?? (examples as any)['with-ref']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-ref')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-ref' for PixelBareInput."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
