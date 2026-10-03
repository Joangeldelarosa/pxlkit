import { Component, signal } from '@angular/core';
import { PxlKitIcon } from '@pxlkit/angular';
import { Heart } from '@pxlkit/gamification';
import { PixelStarRating } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelStarRating],
  template: `<pxl-star-rating [value]="4" />`,
})
export class Default {}

@Component({
  imports: [PixelStarRating],
  template: `<pxl-star-rating [value]="3" [max]="5" showCount />`,
})
export class WithCount {}

@Component({
  imports: [PixelStarRating],
  template: `<pxl-star-rating [value]="5" tone="green" size="lg" />`,
})
export class GreenTone {}

@Component({
  imports: [PixelStarRating],
  template: `<pxl-star-rating [(value)]="rating" interactive />`,
})
export class Interactive {
  readonly rating = signal(3);
}

@Component({
  imports: [PixelStarRating, PxlKitIcon],
  template: `
    <pxl-star-rating [value]="3" [starIcon]="heart" />
    <ng-template #heart><pxl-icon [icon]="heartIcon" [size]="20" appearance="solid" color="#EF4444" /></ng-template>
  `,
})
export class CustomIcon {
  readonly heartIcon = Heart;
}
