import React from 'react';
import { PixelBadgeGroup } from './PixelBadgeGroup';
import { PixelBadge } from './PixelBadge';

export function Default() {
  return (
    <PixelBadgeGroup aria-label="Tags">
      <PixelBadge tone="cyan">react</PixelBadge>
      <PixelBadge tone="green">typescript</PixelBadge>
      <PixelBadge tone="gold">design</PixelBadge>
    </PixelBadgeGroup>
  );
}

export function Overflow() {
  return (
    <PixelBadgeGroup aria-label="Stack" max={3}>
      <PixelBadge tone="cyan">react</PixelBadge>
      <PixelBadge tone="green">typescript</PixelBadge>
      <PixelBadge tone="gold">design</PixelBadge>
      <PixelBadge tone="purple">tailwind</PixelBadge>
      <PixelBadge tone="pink">motion</PixelBadge>
      <PixelBadge tone="red">vitest</PixelBadge>
    </PixelBadgeGroup>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelBadgeGroup aria-label="Pixel tags" surface="pixel">
        <PixelBadge tone="cyan">pixel</PixelBadge>
        <PixelBadge tone="green">chamfered</PixelBadge>
        <PixelBadge tone="gold">retro</PixelBadge>
      </PixelBadgeGroup>
      <PixelBadgeGroup aria-label="Linear tags" surface="linear">
        <PixelBadge tone="cyan">linear</PixelBadge>
        <PixelBadge tone="green">pill</PixelBadge>
        <PixelBadge tone="gold">modern</PixelBadge>
      </PixelBadgeGroup>
    </div>
  );
}
