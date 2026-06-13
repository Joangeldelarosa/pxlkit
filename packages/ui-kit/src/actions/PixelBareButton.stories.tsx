// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelBareButton.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelBareButton';
import manifest from './PixelBareButton.manifest';
import * as examples from './PixelBareButton.examples';

const meta: Meta = {
  title: 'UI Kit / Actions / PixelBareButton',
  component: (Component as any).PixelBareButton ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-actions"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelBareButton — generated stub.',
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
          {"Missing example 'default' for PixelBareButton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With custom class */
export const WithCustomClass: Story = {
  name: 'With custom class',
  tags: ["example-with-custom-class"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithCustomClass ?? (examples as any)['with-custom-class']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-custom-class')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-custom-class' for PixelBareButton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With onClick */
export const WithOnClick: Story = {
  name: 'With onClick',
  tags: ["example-with-on-click"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithOnClick ?? (examples as any)['with-on-click']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-on-click')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-on-click' for PixelBareButton."}
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
          {"Missing example 'disabled' for PixelBareButton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Submit / reset type */
export const SubmitType: Story = {
  name: 'Submit / reset type',
  tags: ["example-submit-type"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).SubmitType ?? (examples as any)['submit-type']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'submit-type')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'submit-type' for PixelBareButton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** As icon trigger */
export const AsIconTrigger: Story = {
  name: 'As icon trigger',
  tags: ["example-as-icon-trigger"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsIconTrigger ?? (examples as any)['as-icon-trigger']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'as-icon-trigger')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'as-icon-trigger' for PixelBareButton."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
