import { Component } from '@angular/core';
import { PixelBadge, PixelBadgeGroup, PixelBadgeGroupItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBadge, PixelBadgeGroup, PixelBadgeGroupItem],
  template: `
    <pxl-badge-group aria-label="Tags">
      <pxl-badge *pxlBadgeGroupItem tone="cyan">react</pxl-badge>
      <pxl-badge *pxlBadgeGroupItem tone="green">typescript</pxl-badge>
      <pxl-badge *pxlBadgeGroupItem tone="gold">design</pxl-badge>
    </pxl-badge-group>
  `,
})
export class Default {}

@Component({
  imports: [PixelBadge, PixelBadgeGroup, PixelBadgeGroupItem],
  template: `
    <pxl-badge-group aria-label="Stack" [max]="3">
      <pxl-badge *pxlBadgeGroupItem tone="cyan">react</pxl-badge>
      <pxl-badge *pxlBadgeGroupItem tone="green">typescript</pxl-badge>
      <pxl-badge *pxlBadgeGroupItem tone="gold">design</pxl-badge>
      <pxl-badge *pxlBadgeGroupItem tone="purple">tailwind</pxl-badge>
      <pxl-badge *pxlBadgeGroupItem tone="pink">motion</pxl-badge>
      <pxl-badge *pxlBadgeGroupItem tone="red">vitest</pxl-badge>
    </pxl-badge-group>
  `,
})
export class Overflow {}

@Component({
  imports: [PixelBadge, PixelBadgeGroup, PixelBadgeGroupItem],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-badge-group aria-label="Pixel tags" surface="pixel">
        <pxl-badge *pxlBadgeGroupItem tone="cyan">pixel</pxl-badge>
        <pxl-badge *pxlBadgeGroupItem tone="green">chamfered</pxl-badge>
        <pxl-badge *pxlBadgeGroupItem tone="gold">retro</pxl-badge>
      </pxl-badge-group>
      <pxl-badge-group aria-label="Linear tags" surface="linear">
        <pxl-badge *pxlBadgeGroupItem tone="cyan">linear</pxl-badge>
        <pxl-badge *pxlBadgeGroupItem tone="green">pill</pxl-badge>
        <pxl-badge *pxlBadgeGroupItem tone="gold">modern</pxl-badge>
      </pxl-badge-group>
    </div>
  `,
})
export class Surfaces {}
