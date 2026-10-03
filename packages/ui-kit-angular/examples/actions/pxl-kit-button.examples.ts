import { Component } from '@angular/core';
import { PxlKitButton } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PxlKitButton],
  template: `
    <button pxlKitButton label="Favorite" [icon]="star"></button>
    <ng-template #star>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    </ng-template>
  `,
})
export class Default {}

@Component({
  imports: [PxlKitButton],
  template: `
    <div class="flex flex-wrap gap-2">
      <button pxlKitButton label="Neutral" [icon]="star" tone="neutral"></button>
      <button pxlKitButton label="Green" [icon]="star" tone="green"></button>
      <button pxlKitButton label="Cyan" [icon]="star" tone="cyan"></button>
      <button pxlKitButton label="Gold" [icon]="star" tone="gold"></button>
      <button pxlKitButton label="Red" [icon]="star" tone="red"></button>
      <button pxlKitButton label="Purple" [icon]="star" tone="purple"></button>
      <button pxlKitButton label="Pink" [icon]="star" tone="pink"></button>
    </div>
    <ng-template #star>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    </ng-template>
  `,
})
export class Tones {}

@Component({
  imports: [PxlKitButton],
  template: `
    <div class="flex items-center gap-2">
      <button pxlKitButton label="Small" [icon]="plus" size="sm"></button>
      <button pxlKitButton label="Medium" [icon]="plus" size="md"></button>
      <button pxlKitButton label="Large" [icon]="plus" size="lg"></button>
    </div>
    <ng-template #plus>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </ng-template>
  `,
})
export class Sizes {}

@Component({
  imports: [PxlKitButton],
  template: `
    <div class="flex gap-2">
      <button pxlKitButton label="Pixel surface" [icon]="star" surface="pixel"></button>
      <button pxlKitButton label="Linear surface" [icon]="star" surface="linear"></button>
    </div>
    <ng-template #star>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    </ng-template>
  `,
})
export class Surfaces {}

@Component({
  imports: [PxlKitButton],
  template: `
    <button pxlKitButton label="Disabled" [icon]="star" disabled></button>
    <ng-template #star>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    </ng-template>
  `,
})
export class Disabled {}
