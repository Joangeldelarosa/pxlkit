import { Component } from '@angular/core';
import { AnimatedPxlKitIcon, ParallaxPxlKitIcon, PixelToast, PxlKitIcon } from '@pxlkit/angular';
import { testAnimatedIcon, testIcon, testParallaxIcon } from '../fixtures';

/** Inputs of the bound sections below, also used for the React reference renders. */
export const ssrProps = {
  icon: { icon: testIcon, size: 48, appearance: 'tinted', color: '#FF5500', ariaLabel: 'Trophy' },
  animated: { icon: testAnimatedIcon, size: 40, trigger: 'loop' },
  parallax: { icon: testParallaxIcon, size: 80, layerGap: 20 },
  toast: { visible: true, title: 'Saved!', message: 'All good', icon: testIcon, duration: 5000 },
} as const;

/** One of each component, server-rendered and hydrated by the SSR suites. */
@Component({
  selector: 'pxl-ssr-app',
  imports: [AnimatedPxlKitIcon, ParallaxPxlKitIcon, PixelToast, PxlKitIcon],
  template: `
    <section id="icon">
      <pxl-icon
        [icon]="props.icon.icon"
        [size]="props.icon.size"
        [appearance]="props.icon.appearance"
        [color]="props.icon.color"
        [ariaLabel]="props.icon.ariaLabel"
      />
    </section>
    <section id="animated">
      <pxl-animated-icon [icon]="props.animated.icon" [size]="props.animated.size" [trigger]="props.animated.trigger" />
    </section>
    <section id="parallax">
      <pxl-parallax-icon [icon]="props.parallax.icon" [size]="props.parallax.size" [layerGap]="props.parallax.layerGap" />
    </section>
    <section id="toast">
      <pxl-toast
        [visible]="props.toast.visible"
        [title]="props.toast.title"
        [message]="props.toast.message"
        [icon]="props.toast.icon"
        [duration]="props.toast.duration"
      />
    </section>
    <section id="hidden-toast">
      <pxl-toast [visible]="false" title="Hidden" />
    </section>
    <section id="attributes">
      <pxl-animated-icon [icon]="props.animated.icon" size="24" trigger="once" />
      <pxl-toast visible title="Static title" duration="0" showClose="false" />
    </section>
  `,
})
export class SsrApp {
  readonly props = ssrProps;
}

export const SSR_DOCUMENT = '<!doctype html><html><head></head><body><pxl-ssr-app></pxl-ssr-app></body></html>';
