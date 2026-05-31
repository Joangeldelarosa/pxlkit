import React from 'react';
import { PixelFeatureCard } from './PixelFeatureCard';

const PixelIcon = (
  <svg viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" className="h-4 w-4">
    <rect x="3" y="0" width="2" height="8" />
    <rect x="0" y="3" width="8" height="2" />
  </svg>
);

export function Default() {
  return (
    <PixelFeatureCard
      title="Realtime sync"
      description="Push every keystroke to peers via WebSockets — under 50ms p95."
    />
  );
}

export function WithIcon() {
  return (
    <PixelFeatureCard
      icon={PixelIcon}
      title="Pixel-perfect"
      description="Crisp edges on every retina ratio thanks to shape-rendering: crispEdges."
    />
  );
}

export function WithBadge() {
  return (
    <PixelFeatureCard
      icon={PixelIcon}
      badge={{ label: 'NEW', tone: 'gold' }}
      title="AI Companion"
      description="A built-in copilot that learns your codebase as you ship it."
    />
  );
}

export function Tones() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelFeatureCard icon={PixelIcon} tone="cyan" title="Cyan" description="Tinted icon frame." />
      <PixelFeatureCard icon={PixelIcon} tone="green" title="Green" description="Tinted icon frame." />
      <PixelFeatureCard icon={PixelIcon} tone="gold" title="Gold" description="Tinted icon frame." />
      <PixelFeatureCard icon={PixelIcon} tone="purple" title="Purple" description="Tinted icon frame." />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelFeatureCard surface="pixel" icon={PixelIcon} title="Pixel" description="Thick border + offset shadow." />
      <PixelFeatureCard surface="linear" icon={PixelIcon} title="Linear" description="Soft border + smooth radius." />
    </div>
  );
}

export function Horizontal() {
  return (
    <PixelFeatureCard
      orientation="horizontal"
      icon={PixelIcon}
      title="Horizontal layout"
      description="Icon sits to the left of the title and description."
    />
  );
}

export function Interactive() {
  return (
    <PixelFeatureCard
      interactive
      onClick={() => alert('feature clicked')}
      icon={PixelIcon}
      title="Click me"
      description="Press Enter or Space to activate via keyboard."
    />
  );
}

export function AsLink() {
  return (
    <PixelFeatureCard
      href="https://example.com"
      target="_blank"
      rel="noopener noreferrer"
      icon={PixelIcon}
      title="Read the docs"
      description="Root renders as <a href> when href is provided."
    />
  );
}

export function WithFooter() {
  return (
    <PixelFeatureCard
      icon={PixelIcon}
      title="Realtime sync"
      description="Push every keystroke to peers via WebSockets."
      footer={<span className="text-xs text-retro-muted">Learn more →</span>}
    />
  );
}

export function ClampedDescription() {
  return (
    <PixelFeatureCard
      icon={PixelIcon}
      title="Long Description"
      description="This description is intentionally long to demonstrate the line-clamp behavior. It will be truncated to the configured number of lines with an ellipsis, while maintaining a minimum height so cards stay aligned in a grid."
      descriptionLines={2}
    />
  );
}

export function IconSizes() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelFeatureCard icon={PixelIcon} iconSize={48} title="Small" description="48px icon frame." />
      <PixelFeatureCard icon={PixelIcon} iconSize={80} title="Large" description="80px icon frame." />
    </div>
  );
}
