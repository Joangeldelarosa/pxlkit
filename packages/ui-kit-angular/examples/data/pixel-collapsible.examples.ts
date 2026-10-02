import { Component } from '@angular/core';
import { PixelCollapsible } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCollapsible],
  template: `
    <pxl-collapsible label="Show details">
      <p class="text-xs text-retro-muted">Hidden content revealed when the header is toggled.</p>
    </pxl-collapsible>
  `,
})
export class Default {}

@Component({
  imports: [PixelCollapsible],
  template: `
    <pxl-collapsible label="Already expanded" defaultOpen>
      <p class="text-xs text-retro-muted">Renders open on first mount; click the header to collapse.</p>
    </pxl-collapsible>
  `,
})
export class DefaultOpen {}

@Component({
  imports: [PixelCollapsible],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-collapsible label="Cyan section" tone="cyan">
        <p class="text-xs text-retro-muted">Cyan-tinted toggle.</p>
      </pxl-collapsible>
      <pxl-collapsible label="Green section" tone="green">
        <p class="text-xs text-retro-muted">Green-tinted toggle.</p>
      </pxl-collapsible>
      <pxl-collapsible label="Gold section" tone="gold">
        <p class="text-xs text-retro-muted">Gold-tinted toggle.</p>
      </pxl-collapsible>
      <pxl-collapsible label="Red section" tone="red">
        <p class="text-xs text-retro-muted">Red-tinted toggle.</p>
      </pxl-collapsible>
      <pxl-collapsible label="Purple section" tone="purple">
        <p class="text-xs text-retro-muted">Purple-tinted toggle.</p>
      </pxl-collapsible>
      <pxl-collapsible label="Pink section" tone="pink">
        <p class="text-xs text-retro-muted">Pink-tinted toggle.</p>
      </pxl-collapsible>
      <pxl-collapsible label="Neutral section" tone="neutral">
        <p class="text-xs text-retro-muted">Neutral-tinted toggle.</p>
      </pxl-collapsible>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelCollapsible],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-collapsible label="Pixel surface" surface="pixel">
        <p class="text-xs text-retro-muted">Retro pixel typography.</p>
      </pxl-collapsible>
      <pxl-collapsible label="Linear surface" surface="linear">
        <p class="text-xs text-retro-muted">Smoother linear surface.</p>
      </pxl-collapsible>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelCollapsible],
  template: `
    <pxl-collapsible label="Release notes" tone="cyan" defaultOpen>
      <ul class="list-disc pl-4 text-xs text-retro-muted">
        <li>Added tone-aware chevron header</li>
        <li>Surface-aware typography (pixel vs linear)</li>
        <li>Toggle state preserved on re-render</li>
      </ul>
    </pxl-collapsible>
  `,
})
export class RichContent {}
