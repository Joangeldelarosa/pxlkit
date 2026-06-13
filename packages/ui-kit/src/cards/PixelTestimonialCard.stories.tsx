// @ts-nocheck — generated stub. Delete this comment after curating.
/* eslint-disable */
/**
 * AUTO-GENERATED stub story for PixelTestimonialCard.
 * Source: scripts/build-docs/generate-stories.ts
 *
 * Safe to edit — once this file is committed the generator will refuse
 * to overwrite it (a hand-authored *.stories.tsx is detected).
 */

import type { Meta, StoryObj } from '@storybook/react';
import * as Component from './PixelTestimonialCard';
import manifest from './PixelTestimonialCard.manifest';
import * as examples from './PixelTestimonialCard.examples';

const meta: Meta = {
  title: 'UI Kit / Cards / PixelTestimonialCard',
  component: (Component as any).PixelTestimonialCard ?? (Component as any).default,
  tags: ["autodocs","status-stable","cat-cards"],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          (manifest as any)?.description ?? 'PixelTestimonialCard — generated stub.',
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
          {"Missing example 'default' for PixelTestimonialCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** With avatar + tone */
export const WithAvatarAndTone: Story = {
  name: 'With avatar + tone',
  tags: ["example-with-avatar-and-tone"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).WithAvatarAndTone ?? (examples as any)['with-avatar-and-tone']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'with-avatar-and-tone')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'with-avatar-and-tone' for PixelTestimonialCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};

/** Compact quote */
export const CompactQuote: Story = {
  name: 'Compact quote',
  tags: ["example-compact-quote"],
  parameters: {
    docs: { description: { story: undefined } },
  },
  render: () => {
    const ExampleComponent =
      ((examples as any).CompactQuote ?? (examples as any)['compact-quote']) ??
      ((manifest as any)?.examples?.find?.((e: any) => e?.id === 'compact-quote')?.Component);
    if (!ExampleComponent) {
      return (
        <pre style={{ color: 'crimson' }}>
          {"Missing example 'compact-quote' for PixelTestimonialCard."}
        </pre>
      );
    }
    return <ExampleComponent />;
  },
};
