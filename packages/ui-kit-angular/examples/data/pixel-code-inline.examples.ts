import { Component } from '@angular/core';
import { PixelCodeInline } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCodeInline],
  template: `<code pxlCodeInline>npm install</code>`,
})
export class Default {}

@Component({
  imports: [PixelCodeInline],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <code pxlCodeInline tone="neutral">neutral</code>
      <code pxlCodeInline tone="cyan">cyan</code>
      <code pxlCodeInline tone="green">green</code>
      <code pxlCodeInline tone="gold">gold</code>
      <code pxlCodeInline tone="red">red</code>
      <code pxlCodeInline tone="purple">purple</code>
      <code pxlCodeInline tone="pink">pink</code>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelCodeInline],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <code pxlCodeInline surface="pixel">surface="pixel"</code>
      <code pxlCodeInline surface="linear">surface="linear"</code>
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelCodeInline],
  template: `
    <p class="text-sm text-retro-text">
      Run <code pxlCodeInline>pnpm dev</code> to start the local server,
      then open <code pxlCodeInline tone="green">http://localhost:3000</code>.
    </p>
  `,
})
export class InlineInProse {}

@Component({
  imports: [PixelCodeInline],
  template: `
    <div class="flex flex-col gap-2">
      <div>Import: <code pxlCodeInline>import &#123; PixelCodeInline &#125; from '&#64;pxlkit/ui'</code></div>
      <div>Hotkey: <code pxlCodeInline tone="purple">Ctrl+K</code></div>
      <div>Error: <code pxlCodeInline tone="red">EACCES</code></div>
    </div>
  `,
})
export class CodeSamples {}
