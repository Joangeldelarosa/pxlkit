import { Component } from '@angular/core';
import { PixelSectionHeader } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSectionHeader],
  template: `
    <pxl-section-header
      eyebrow="Section"
      title="Build pixel-perfect interfaces"
      description="A retro-cinematic component kit with surface awareness and rhythm tokens."
    />
  `,
})
export class Default {}

@Component({
  imports: [PixelSectionHeader],
  template: `
    <pxl-section-header
      align="center"
      eyebrow="Features"
      title="Designed for clarity"
      description="Centered headers work great as page intros above a feature grid."
    />
  `,
})
export class Centered {}

@Component({
  imports: [PixelSectionHeader],
  template: `
    <pxl-section-header
      eyebrow="Dashboard"
      title="Recent activity"
      description="What happened across your workspace today."
      titleTone="cyan"
      [actions]="actions"
    />
    <ng-template #actions>
      <button type="button">Refresh</button>
      <button type="button">Export</button>
    </ng-template>
  `,
})
export class WithActions {}

@Component({
  imports: [PixelSectionHeader],
  template: `
    <pxl-section-header
      as="h1"
      size="lg"
      align="center"
      spacing="loose"
      eyebrow="Introducing pxlkit"
      title="The retro-cinematic UI kit"
      description="Build interfaces that feel handcrafted, with a coherent token system."
      titleTone="green"
    />
  `,
})
export class LargeHero {}
