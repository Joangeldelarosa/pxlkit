import { Component } from '@angular/core';
import { PixelStatCard } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelStatCard],
  template: `<pxl-stat-card label="Revenue" value="$12,480" trend="+8.2% vs last week" />`,
})
export class Default {}

@Component({
  imports: [PixelStatCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-stat-card label="Active" value="1,204" tone="green" trend="+3.1%" />
      <pxl-stat-card label="Pending" value="48" tone="gold" trend="2 overdue" />
      <pxl-stat-card label="Cancelled" value="12" tone="red" trend="-1 vs ayer" />
      <pxl-stat-card label="Sessions" value="3.2k" tone="cyan" trend="+220 hoy" />
      <pxl-stat-card label="Members" value="89" tone="purple" />
      <pxl-stat-card label="Likes" value="412" tone="pink" />
      <pxl-stat-card label="Drafts" value="7" tone="neutral" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelStatCard],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-stat-card label="Small" value="$1,200" size="sm" trend="+2%" tone="cyan" />
      <pxl-stat-card label="Medium" value="$8,400" size="md" trend="+5%" tone="gold" />
      <pxl-stat-card label="Large" value="$24,900" size="lg" trend="+11%" tone="green" />
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelStatCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-stat-card label="Pixel" value="$4,200" surface="pixel" tone="gold" trend="+6%" />
      <pxl-stat-card label="Linear" value="$4,200" surface="linear" tone="gold" trend="+6%" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelStatCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-stat-card label="Top" value="$1,200" [icon]="dot" iconPosition="top" tone="cyan" />
      <pxl-stat-card label="Left" value="$1,200" [icon]="dot" iconPosition="left" tone="green" />
      <pxl-stat-card label="Right" value="$1,200" [icon]="dot" iconPosition="right" tone="purple" />
      <pxl-stat-card label="Bottom-left" value="$1,200" [icon]="dot" iconPosition="bottom-left" tone="gold" />
    </div>
    <ng-template #dot><span aria-hidden="true">$</span></ng-template>
  `,
})
export class IconPositions {}

@Component({
  imports: [PixelStatCard],
  template: `<pxl-stat-card label="Total users" value="12,480" tone="cyan" />`,
})
export class WithoutTrend {}

@Component({
  imports: [PixelStatCard],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <pxl-stat-card label="Uptime" value="99.98%" tone="green" valueTone align="center" />
      <pxl-stat-card label="Error rate" value="0.02%" tone="red" valueTone align="center" />
    </div>
  `,
})
export class TonedValueCentered {}
