import { Component } from '@angular/core';
import { PixelHeroMedia } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelHeroMedia],
  template: `
    <figure pxlHeroMedia ratio="16/10">
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xs font-mono text-retro-muted"
      >
        16:10 media
      </div>
    </figure>
  `,
})
export class Default {}

@Component({
  imports: [PixelHeroMedia],
  template: `
    <figure pxlHeroMedia ratio="16/9" framed tone="cyan" caption="Framed hero with caption">
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xs font-mono text-retro-muted"
      >
        16:9 framed
      </div>
    </figure>
  `,
})
export class Framed {}

@Component({
  imports: [PixelHeroMedia],
  template: `
    <figure pxlHeroMedia ratio="1/1" framed tone="purple">
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xs font-mono text-retro-muted"
      >
        1:1 square
      </div>
    </figure>
  `,
})
export class Square {}
