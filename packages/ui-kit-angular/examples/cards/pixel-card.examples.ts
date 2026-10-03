import { Component } from '@angular/core';
import { PixelCard, PixelCardBody, PixelCardFooter, PixelCardHeader } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card title="Project Atlas">
      <p>Compact dossier on the Atlas migration. Status nominal.</p>
    </pxl-card>
  `,
})
export class Default {}

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card>
      <p>Omit the title to get a plain well container — no header, no divider.</p>
    </pxl-card>
  `,
})
export class Headerless {}

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card title="System Health" [icon]="icon">
      <p>All checks green. Last sync 3 minutes ago.</p>
    </pxl-card>
    <ng-template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-3 w-3">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </ng-template>
  `,
})
export class WithIcon {}

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card
      title="Release Notes"
      description="A short summary of what changed in this release, useful as a card subtitle."
    >
      <p>Body content sits under the description.</p>
    </pxl-card>
  `,
})
export class WithDescription {}

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card title="Invoice #1042" [footer]="due">
      <p>Total: $1,250.00</p>
    </pxl-card>
    <ng-template #due><span class="text-xs text-retro-muted">Due in 7 days</span></ng-template>
  `,
})
export class WithFooter {}

@Component({
  imports: [PixelCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-card title="Cyan" tone="cyan">Tinted border + soft background.</pxl-card>
      <pxl-card title="Green" tone="green">Tinted border + soft background.</pxl-card>
      <pxl-card title="Gold" tone="gold">Tinted border + soft background.</pxl-card>
      <pxl-card title="Purple" tone="purple">Tinted border + soft background.</pxl-card>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-card title="Pixel" surface="pixel">Thick border + offset shadow.</pxl-card>
      <pxl-card title="Linear" surface="linear">Soft border + smooth radius.</pxl-card>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelCard],
  template: `
    <div
      pxlCard
      title="Click me"
      interactive
      description="Press Enter or Space to activate via keyboard."
      (click)="activate()"
    >
      <p>Renders as role=button with focus ring.</p>
    </div>
  `,
})
export class Interactive {
  activate(): void {
    alert('card clicked');
  }
}

@Component({
  imports: [PixelCard],
  template: `
    <a
      pxlCard
      title="Read the docs"
      href="https://example.com"
      target="_blank"
      rel="noopener noreferrer"
      description="Root renders as <a href> when href is provided."
    ></a>
  `,
})
export class AsLink {}

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card title="Cover Story" [media]="cover" description="Media slot sits above the header.">
      <p>Card body.</p>
    </pxl-card>
    <ng-template #cover><div class="h-24 w-full bg-gradient-to-br from-retro-cyan/40 to-retro-purple/40"></div></ng-template>
  `,
})
export class WithMedia {}

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card
      title="New Feature"
      [badge]="{ label: 'NEW', tone: 'gold' }"
      description="Ribbon badge anchors in the top-right corner."
    >
      <p>Useful for highlighting fresh content.</p>
    </pxl-card>
  `,
})
export class WithBadge {}

@Component({
  imports: [PixelCard],
  template: `
    <pxl-card
      title="Long Description"
      description="This description is intentionally long to demonstrate the line-clamp behavior. It will be truncated to the configured number of lines with an ellipsis, while maintaining a minimum height so cards stay aligned in a grid."
      [descriptionLines]="2"
    >
      <p>Body still renders below the clamp.</p>
    </pxl-card>
  `,
})
export class ClampedDescription {}

@Component({
  imports: [PixelCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-card title="Small" padding="sm">Tight padding.</pxl-card>
      <pxl-card title="Large" padding="lg">Roomy padding.</pxl-card>
    </div>
  `,
})
export class PaddingScale {}

@Component({
  imports: [PixelCard, PixelCardHeader, PixelCardBody, PixelCardFooter],
  template: `
    <pxl-card title="Composed">
      <pxl-card-header>
        <span class="text-sm font-semibold">Custom header</span>
      </pxl-card-header>
      <pxl-card-body>
        <p>Body slot via subcomponent.</p>
      </pxl-card-body>
      <pxl-card-footer>
        <span class="text-xs text-retro-muted">Footer slot</span>
      </pxl-card-footer>
    </pxl-card>
  `,
})
export class WithSubcomponents {}
