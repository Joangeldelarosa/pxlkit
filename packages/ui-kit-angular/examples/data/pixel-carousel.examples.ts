import { Component } from '@angular/core';
import { PixelCarousel, PixelCarouselItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelCarousel, PixelCarouselItem],
  template: `
    <pxl-carousel aria-label="Featured items">
      @for (slide of slides; track slide.label) {
        <pxl-carousel-item>
          <div class="flex h-32 items-center justify-center border border-retro-border bg-retro-surface text-retro-text" [style.background]="slide.tone">
            <span class="text-xs">{{ slide.label }}</span>
          </div>
        </pxl-carousel-item>
      }
    </pxl-carousel>
  `,
})
export class Default {
  readonly slides = [
    { label: 'Slide 1', tone: 'rgba(14,165,233,0.15)' },
    { label: 'Slide 2', tone: 'rgba(168,85,247,0.15)' },
    { label: 'Slide 3', tone: 'rgba(34,197,94,0.15)' },
  ];
}

@Component({
  imports: [PixelCarousel, PixelCarouselItem],
  template: `
    <pxl-carousel aria-label="Featured items with dots" showDots>
      @for (slide of slides; track slide.label) {
        <pxl-carousel-item>
          <div class="flex h-32 items-center justify-center border border-retro-border bg-retro-surface text-retro-text" [style.background]="slide.tone">
            <span class="text-xs">{{ slide.label }}</span>
          </div>
        </pxl-carousel-item>
      }
    </pxl-carousel>
  `,
})
export class WithDots {
  readonly slides = [
    { label: 'One', tone: 'rgba(14,165,233,0.15)' },
    { label: 'Two', tone: 'rgba(168,85,247,0.15)' },
    { label: 'Three', tone: 'rgba(34,197,94,0.15)' },
  ];
}

@Component({
  imports: [PixelCarousel, PixelCarouselItem],
  template: `
    <pxl-carousel aria-label="Looping carousel" [opts]="{ loop: true }" showDots>
      @for (slide of slides; track slide.label) {
        <pxl-carousel-item>
          <div class="flex h-32 items-center justify-center border border-retro-border bg-retro-surface text-retro-text" [style.background]="slide.tone">
            <span class="text-xs">{{ slide.label }}</span>
          </div>
        </pxl-carousel-item>
      }
    </pxl-carousel>
  `,
})
export class Looping {
  readonly slides = [
    { label: 'Alpha', tone: 'rgba(14,165,233,0.15)' },
    { label: 'Beta', tone: 'rgba(168,85,247,0.15)' },
    { label: 'Gamma', tone: 'rgba(34,197,94,0.15)' },
  ];
}

@Component({
  imports: [PixelCarousel, PixelCarouselItem],
  template: `
    <div style="height: 240px">
      <pxl-carousel aria-label="Vertical carousel" orientation="vertical" showDots>
        @for (slide of slides; track slide.label) {
          <pxl-carousel-item>
            <div class="flex h-32 items-center justify-center border border-retro-border bg-retro-surface text-retro-text" [style.background]="slide.tone">
              <span class="text-xs">{{ slide.label }}</span>
            </div>
          </pxl-carousel-item>
        }
      </pxl-carousel>
    </div>
  `,
})
export class Vertical {
  readonly slides = [
    { label: 'Top', tone: 'rgba(14,165,233,0.15)' },
    { label: 'Middle', tone: 'rgba(168,85,247,0.15)' },
    { label: 'Bottom', tone: 'rgba(34,197,94,0.15)' },
  ];
}

@Component({
  imports: [PixelCarousel, PixelCarouselItem],
  template: `
    <pxl-carousel aria-label="Linear surface carousel" surface="linear" showDots>
      @for (slide of slides; track slide.label) {
        <pxl-carousel-item>
          <div class="flex h-32 items-center justify-center border border-retro-border bg-retro-surface text-retro-text" [style.background]="slide.tone">
            <span class="text-xs">{{ slide.label }}</span>
          </div>
        </pxl-carousel-item>
      }
    </pxl-carousel>
  `,
})
export class LinearSurface {
  readonly slides = [
    { label: 'Slide 1', tone: 'rgba(14,165,233,0.15)' },
    { label: 'Slide 2', tone: 'rgba(168,85,247,0.15)' },
  ];
}
