// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelDropdown.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelDropdown';
import manifest from './PixelDropdown.manifest';
import * as examples from './PixelDropdown.examples';

const meta: Meta = {
  title: 'UI Kit / Overlays / PixelDropdown',
  component: (Component as any).PixelDropdown ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-overlays"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelDropdown — generated stub.',
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
          {"Missing example 'default' for PixelDropdown."}
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
          {"Missing example 'tones' for PixelDropdown."}
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
          {"Missing example 'surfaces' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Disabled trigger */
export const Disabled: Story = {
  name: 'Disabled trigger',
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
          {"Missing example 'disabled' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Shortcuts */
export const WithIconsAndShortcuts: Story = {
  name: 'Shortcuts',
  tags: ["example-with-icons-and-shortcuts"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithIconsAndShortcuts ?? (examples as any)['with-icons-and-shortcuts']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-icons-and-shortcuts')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-icons-and-shortcuts' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Headers + separators */
export const HeadersAndSeparators: Story = {
  name: 'Headers + separators',
  tags: ["example-headers-and-separators"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).HeadersAndSeparators ?? (examples as any)['headers-and-separators']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'headers-and-separators')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'headers-and-separators' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Checkbox + radio items */
export const CheckboxAndRadio: Story = {
  name: 'Checkbox + radio items',
  tags: ["example-checkbox-and-radio"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CheckboxAndRadio ?? (examples as any)['checkbox-and-radio']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'checkbox-and-radio')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'checkbox-and-radio' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Disabled items */
export const DisabledItems: Story = {
  name: 'Disabled items',
  tags: ["example-disabled-items"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).DisabledItems ?? (examples as any)['disabled-items']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'disabled-items')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'disabled-items' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Compositional API */
export const Composition: Story = {
  name: 'Compositional API',
  tags: ["example-composition"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).Composition ?? (examples as any)['composition']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'composition')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'composition' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Controlled open */
export const ControlledOpen: Story = {
  name: 'Controlled open',
  tags: ["example-controlled-open"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ControlledOpen ?? (examples as any)['controlled-open']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'controlled-open')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'controlled-open' for PixelDropdown."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
