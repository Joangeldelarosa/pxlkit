import React from 'react';
import { PixelSectionHeader } from './PixelSectionHeader';

export function Default() {
  return (
    <PixelSectionHeader
      eyebrow="Section"
      title="Build pixel-perfect interfaces"
      description="A retro-cinematic component kit with surface awareness and rhythm tokens."
    />
  );
}

export function Centered() {
  return (
    <PixelSectionHeader
      align="center"
      eyebrow="Features"
      title="Designed for clarity"
      description="Centered headers work great as page intros above a feature grid."
    />
  );
}

export function WithActions() {
  return (
    <PixelSectionHeader
      eyebrow="Dashboard"
      title="Recent activity"
      description="What happened across your workspace today."
      titleTone="cyan"
      actions={
        <>
          <button type="button">Refresh</button>
          <button type="button">Export</button>
        </>
      }
    />
  );
}

export function LargeHero() {
  return (
    <PixelSectionHeader
      as="h1"
      size="lg"
      align="center"
      spacing="loose"
      eyebrow="Introducing pxlkit"
      title="The retro-cinematic UI kit"
      description="Build interfaces that feel handcrafted, with a coherent token system."
      titleTone="green"
    />
  );
}
