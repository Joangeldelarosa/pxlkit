import { Component } from '@angular/core';
import { PixelFeatureCard } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelFeatureCard],
  template: `
    <pxl-feature-card
      title="Realtime sync"
      description="Push every keystroke to peers via WebSockets — under 50ms p95."
    />
  `,
})
export class Default {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <pxl-feature-card
      [icon]="icon"
      title="Pixel-perfect"
      description="Crisp edges on every retina ratio thanks to shape-rendering: crispEdges."
    />
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class WithIcon {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <pxl-feature-card
      [icon]="icon"
      [badge]="{ label: 'NEW', tone: 'gold' }"
      title="AI Companion"
      description="A built-in copilot that learns your codebase as you ship it."
    />
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class WithBadge {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-feature-card [icon]="icon" tone="cyan" title="Cyan" description="Tinted icon frame." />
      <pxl-feature-card [icon]="icon" tone="green" title="Green" description="Tinted icon frame." />
      <pxl-feature-card [icon]="icon" tone="gold" title="Gold" description="Tinted icon frame." />
      <pxl-feature-card [icon]="icon" tone="purple" title="Purple" description="Tinted icon frame." />
    </div>
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class Tones {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-feature-card surface="pixel" [icon]="icon" title="Pixel" description="Thick border + offset shadow." />
      <pxl-feature-card surface="linear" [icon]="icon" title="Linear" description="Soft border + smooth radius." />
    </div>
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <pxl-feature-card
      orientation="horizontal"
      [icon]="icon"
      title="Horizontal layout"
      description="Icon sits to the left of the title and description."
    />
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class Horizontal {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <div
      pxlFeatureCard
      interactive
      [icon]="icon"
      title="Click me"
      description="Press Enter or Space to activate via keyboard."
      (click)="activate()"
    ></div>
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class Interactive {
  activate(): void {
    alert('feature clicked');
  }
}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <a
      pxlFeatureCard
      href="https://example.com"
      target="_blank"
      rel="noopener noreferrer"
      [icon]="icon"
      title="Read the docs"
      description="Root renders as <a href> when href is provided."
    ></a>
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class AsLink {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <pxl-feature-card
      [icon]="icon"
      title="Realtime sync"
      description="Push every keystroke to peers via WebSockets."
      [footer]="more"
    />
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
    <ng-template #more><span class="text-xs text-retro-muted">Learn more →</span></ng-template>
  `,
})
export class WithFooter {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <pxl-feature-card
      [icon]="icon"
      title="Long Description"
      description="This description is intentionally long to demonstrate the line-clamp behavior. It will be truncated to the configured number of lines with an ellipsis, while maintaining a minimum height so cards stay aligned in a grid."
      [descriptionLines]="2"
    />
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class ClampedDescription {}

@Component({
  imports: [PixelFeatureCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-feature-card [icon]="icon" [iconSize]="48" title="Small" description="48px icon frame." />
      <pxl-feature-card [icon]="icon" [iconSize]="80" title="Large" description="80px icon frame." />
    </div>
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class IconSizes {}
