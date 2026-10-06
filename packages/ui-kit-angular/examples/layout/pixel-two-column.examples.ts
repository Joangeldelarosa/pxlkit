import { Component } from '@angular/core';
import { PixelTwoColumn } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelTwoColumn],
  template: `
    <div pxlTwoColumn [left]="left" [right]="right"></div>
    <ng-template #left><div class="text-sm text-retro-muted">Left column</div></ng-template>
    <ng-template #right><div class="text-sm text-retro-muted">Right column</div></ng-template>
  `,
})
export class Default {}

@Component({
  imports: [PixelTwoColumn],
  template: `
    <div pxlTwoColumn ratio="60/40" [gap]="6" [left]="left" [right]="right"></div>
    <ng-template #left><div class="text-sm text-retro-muted">Main content (60%)</div></ng-template>
    <ng-template #right><div class="text-sm text-retro-muted">Sidebar (40%)</div></ng-template>
  `,
})
export class SixtyForty {}

@Component({
  imports: [PixelTwoColumn],
  template: `
    <div pxlTwoColumn ratio="70/30" reverse [left]="left" [right]="right"></div>
    <ng-template #left><div class="text-sm text-retro-muted">Logical left</div></ng-template>
    <ng-template #right><div class="text-sm text-retro-muted">Visually first</div></ng-template>
  `,
})
export class Reversed {}

@Component({
  imports: [PixelTwoColumn],
  template: `
    <div pxlTwoColumn stackBelow="lg" align="center" [left]="left" [right]="right"></div>
    <ng-template #left><div class="text-sm text-retro-muted">Stacks below lg</div></ng-template>
    <ng-template #right><div class="text-sm text-retro-muted">Side-by-side at lg+</div></ng-template>
  `,
})
export class StackedBelowLg {}

@Component({
  imports: [PixelTwoColumn],
  template: `
    <div pxlTwoColumn surface="pixel" ratio="50/50" [left]="left" [right]="right"></div>
    <ng-template #left><div class="text-sm text-retro-muted">Surface-aware left</div></ng-template>
    <ng-template #right><div class="text-sm text-retro-muted">Surface-aware right</div></ng-template>
  `,
})
export class PixelSurface {}
