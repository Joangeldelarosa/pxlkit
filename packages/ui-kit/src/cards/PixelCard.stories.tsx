// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelCard.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelCard';
import manifest from './PixelCard.manifest';
import * as examples from './PixelCard.examples';

const meta: Meta = {
  title: 'UI Kit / Cards / PixelCard',
  component: (Component as any).PixelCard ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-cards"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelCard — generated stub.',
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
          {"Missing example 'default' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Icon */
export const WithIcon: Story = {
  name: 'With Icon',
  tags: ["example-with-icon"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithIcon ?? (examples as any)['with-icon']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-icon')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-icon' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Description */
export const WithDescription: Story = {
  name: 'With Description',
  tags: ["example-with-description"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithDescription ?? (examples as any)['with-description']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-description')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-description' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Footer */
export const WithFooter: Story = {
  name: 'With Footer',
  tags: ["example-with-footer"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithFooter ?? (examples as any)['with-footer']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-footer')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-footer' for PixelCard."}
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
          {"Missing example 'tones' for PixelCard."}
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
          {"Missing example 'surfaces' for PixelCard."}
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
          {"Missing example 'interactive' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** As Link */
export const AsLink: Story = {
  name: 'As Link',
  tags: ["example-as-link"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).AsLink ?? (examples as any)['as-link']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'as-link')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'as-link' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Media */
export const WithMedia: Story = {
  name: 'With Media',
  tags: ["example-with-media"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithMedia ?? (examples as any)['with-media']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-media')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-media' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Ribbon Badge */
export const WithBadge: Story = {
  name: 'With Ribbon Badge',
  tags: ["example-with-badge"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithBadge ?? (examples as any)['with-badge']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-badge')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-badge' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Clamped Description */
export const ClampedDescription: Story = {
  name: 'Clamped Description',
  tags: ["example-clamped-description"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).ClampedDescription ?? (examples as any)['clamped-description']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'clamped-description')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'clamped-description' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Padding Scale */
export const PaddingScale: Story = {
  name: 'Padding Scale',
  tags: ["example-padding-scale"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).PaddingScale ?? (examples as any)['padding-scale']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'padding-scale')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'padding-scale' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With Subcomponents */
export const WithSubcomponents: Story = {
  name: 'With Subcomponents',
  tags: ["example-with-subcomponents"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithSubcomponents ?? (examples as any)['with-subcomponents']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-subcomponents')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-subcomponents' for PixelCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
