import { Component } from '@angular/core';
import { PixelAvatar } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelAvatar],
  template: `<pxl-avatar name="Joangel De La Rosa" />`,
})
export class Default {}

@Component({
  imports: [PixelAvatar],
  template: `
    <div class="flex items-end gap-3">
      <pxl-avatar name="Ana Lopez" size="xs" />
      <pxl-avatar name="Ana Lopez" size="sm" />
      <pxl-avatar name="Ana Lopez" size="md" />
      <pxl-avatar name="Ana Lopez" size="lg" />
      <pxl-avatar name="Ana Lopez" size="xl" />
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelAvatar],
  template: `
    <div class="flex flex-wrap gap-3">
      <pxl-avatar name="Green User" tone="green" />
      <pxl-avatar name="Cyan User" tone="cyan" />
      <pxl-avatar name="Gold User" tone="gold" />
      <pxl-avatar name="Red User" tone="red" />
      <pxl-avatar name="Purple User" tone="purple" />
      <pxl-avatar name="Pink User" tone="pink" />
      <pxl-avatar name="Neutral User" tone="neutral" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelAvatar],
  template: `
    <div class="flex items-center gap-3">
      <pxl-avatar name="Pixel Surface" surface="pixel" />
      <pxl-avatar name="Linear Surface" surface="linear" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelAvatar],
  template: `
    <div class="flex items-center gap-3">
      <pxl-avatar name="Circle Shape" shape="circle" />
      <pxl-avatar name="Rounded Shape" shape="rounded" />
      <pxl-avatar name="Square Shape" shape="square" />
    </div>
  `,
})
export class Shapes {}

@Component({
  imports: [PixelAvatar],
  template: `
    <div class="flex items-center gap-3">
      <pxl-avatar name="Online User" status="online" />
      <pxl-avatar name="Away User" status="away" />
      <pxl-avatar name="Busy User" status="busy" />
      <pxl-avatar name="Offline User" status="offline" />
    </div>
  `,
})
export class Statuses {}

@Component({
  imports: [PixelAvatar],
  template: `<pxl-avatar name="Joangel" src="https://i.pravatar.cc/80?img=12" size="lg" status="online" />`,
})
export class WithImage {}

@Component({
  imports: [PixelAvatar],
  template: `
    <div class="flex items-center gap-3">
      <pxl-avatar name="Alice Adams" colorSeed="alice@example.com" />
      <pxl-avatar name="Bob Brown" colorSeed="bob@example.com" />
      <pxl-avatar name="Carol Chen" colorSeed="carol@example.com" />
      <pxl-avatar name="Dave Diaz" colorSeed="dave@example.com" />
    </div>
  `,
})
export class ColorSeed {}
