import React from 'react';
import { PixelCard } from './PixelCard';

export function Default() {
  return (
    <PixelCard title="Project Atlas">
      <p>Compact dossier on the Atlas migration. Status nominal.</p>
    </PixelCard>
  );
}

export function WithIcon() {
  const Icon = (
    <svg viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" className="h-3 w-3">
      <rect x="3" y="0" width="2" height="8" />
      <rect x="0" y="3" width="8" height="2" />
    </svg>
  );
  return (
    <PixelCard title="System Health" icon={Icon}>
      <p>All checks green. Last sync 3 minutes ago.</p>
    </PixelCard>
  );
}

export function WithDescription() {
  return (
    <PixelCard
      title="Release Notes"
      description="A short summary of what changed in this release, useful as a card subtitle."
    >
      <p>Body content sits under the description.</p>
    </PixelCard>
  );
}

export function WithFooter() {
  return (
    <PixelCard
      title="Invoice #1042"
      footer={<span className="text-xs text-retro-muted">Due in 7 days</span>}
    >
      <p>Total: $1,250.00</p>
    </PixelCard>
  );
}

export function Tones() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelCard title="Cyan" tone="cyan">Tinted border + soft background.</PixelCard>
      <PixelCard title="Green" tone="green">Tinted border + soft background.</PixelCard>
      <PixelCard title="Gold" tone="gold">Tinted border + soft background.</PixelCard>
      <PixelCard title="Purple" tone="purple">Tinted border + soft background.</PixelCard>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelCard title="Pixel" surface="pixel">Thick border + offset shadow.</PixelCard>
      <PixelCard title="Linear" surface="linear">Soft border + smooth radius.</PixelCard>
    </div>
  );
}

export function Interactive() {
  return (
    <PixelCard
      title="Click me"
      interactive
      onClick={() => alert('card clicked')}
      description="Press Enter or Space to activate via keyboard."
    >
      <p>Renders as role=button with focus ring.</p>
    </PixelCard>
  );
}

export function AsLink() {
  return (
    <PixelCard
      title="Read the docs"
      href="https://example.com"
      target="_blank"
      rel="noopener noreferrer"
      description="Root renders as <a href> when href is provided."
    />
  );
}

export function WithMedia() {
  const Media = (
    <div className="h-24 w-full bg-gradient-to-br from-retro-cyan/40 to-retro-purple/40" />
  );
  return (
    <PixelCard title="Cover Story" media={Media} description="Media slot sits above the header.">
      <p>Card body.</p>
    </PixelCard>
  );
}

export function WithBadge() {
  return (
    <PixelCard
      title="New Feature"
      badge={{ label: 'NEW', tone: 'gold' }}
      description="Ribbon badge anchors in the top-right corner."
    >
      <p>Useful for highlighting fresh content.</p>
    </PixelCard>
  );
}

export function ClampedDescription() {
  return (
    <PixelCard
      title="Long Description"
      description="This description is intentionally long to demonstrate the line-clamp behavior. It will be truncated to the configured number of lines with an ellipsis, while maintaining a minimum height so cards stay aligned in a grid."
      descriptionLines={2}
    >
      <p>Body still renders below the clamp.</p>
    </PixelCard>
  );
}

export function PaddingScale() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelCard title="Small" padding="sm">Tight padding.</PixelCard>
      <PixelCard title="Large" padding="lg">Roomy padding.</PixelCard>
    </div>
  );
}

export function WithSubcomponents() {
  return (
    <PixelCard title="Composed">
      <PixelCard.Header>
        <span className="text-sm font-semibold">Custom header</span>
      </PixelCard.Header>
      <PixelCard.Body>
        <p>Body slot via subcomponent.</p>
      </PixelCard.Body>
      <PixelCard.Footer>
        <span className="text-xs text-retro-muted">Footer slot</span>
      </PixelCard.Footer>
    </PixelCard>
  );
}
