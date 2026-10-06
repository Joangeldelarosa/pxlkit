/**
 * <pxl-carousel> on a mocked Embla, as the React kit's tests do: jsdom has
 * no layout, and lacks the observers the real one needs. Covers the options
 * it hands over, the controls and keys that drive it, the state it reports
 * back, the `(api)` output, re-initialising, its slides' names, and the
 * first slide it keeps where Embla cannot run.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { REDUCED_MOTION_QUERY } from '@pxlkit/ui-kit-core';
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelCarousel, PixelCarouselItem } from '../../public-api';
import { installMatchMedia } from '../match-media';

const embla = vi.hoisted(() => {
  type Handler = () => void;
  function fake(root: HTMLElement) {
    const handlers = new Map<string, Set<Handler>>();
    const snaps = [0, 0.5, 1];
    let selected = 0;
    const emit = (event: string) => handlers.get(event)?.forEach((handler) => handler());
    const select = (index: number) => {
      selected = Math.max(0, Math.min(snaps.length - 1, index));
      emit('select');
    };
    return {
      root,
      scrollSnapList: () => snaps,
      selectedScrollSnap: () => selected,
      canScrollPrev: () => selected > 0,
      canScrollNext: () => selected < snaps.length - 1,
      scrollPrev: vi.fn(() => select(selected - 1)),
      scrollNext: vi.fn(() => select(selected + 1)),
      scrollTo: vi.fn((index: number) => select(index)),
      reInit: vi.fn((..._options: unknown[]) => emit('reInit')),
      destroy: vi.fn(),
      on: (event: string, handler: Handler) => {
        if (!handlers.has(event)) handlers.set(event, new Set());
        handlers.get(event)!.add(handler);
      },
      off: (event: string, handler: Handler) => handlers.get(event)?.delete(handler),
      listeners: (event: string) => handlers.get(event)?.size ?? 0,
    };
  }
  const instances: Array<ReturnType<typeof fake>> = [];
  const create = vi.fn((root: HTMLElement, ..._options: unknown[]) => {
    const instance = fake(root);
    instances.push(instance);
    return instance;
  });
  return { create, instances };
});

vi.mock('embla-carousel', () => ({ default: embla.create }));

afterEach(() => {
  embla.create.mockClear();
  embla.instances.length = 0;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'matchMedia');
});

/** What Embla needs from the browser, which jsdom lacks. */
function allowEmbla({ reducedMotion = false } = {}) {
  vi.stubGlobal('IntersectionObserver', class {});
  vi.stubGlobal('ResizeObserver', class {});
  installMatchMedia((query) => reducedMotion && query === REDUCED_MOTION_QUERY);
}

function plugin(delay: number): EmblaPluginType {
  const options = { active: true, delay };
  return { name: 'autoplay', options, init() {}, destroy() {} };
}

const SLIDES = `
  <pxl-carousel-item>One</pxl-carousel-item>
  <pxl-carousel-item>Two</pxl-carousel-item>
  <pxl-carousel-item>Three</pxl-carousel-item>
`;

@Component({
  imports: [PixelCarousel, PixelCarouselItem],
  template: `
    <pxl-carousel
      aria-label="Featured"
      showDots
      [orientation]="orientation()"
      [opts]="opts()"
      [plugins]="plugins()"
      (api)="handed.push($event)"
    >${SLIDES}</pxl-carousel>
  `,
})
class Host {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly opts = signal<Omit<EmblaOptionsType, 'axis'> | undefined>(undefined);
  readonly plugins = signal<EmblaPluginType[] | undefined>(undefined);
  readonly handed: unknown[] = [];
}

async function render(setup: (host: Host) => void = () => {}) {
  const fixture = TestBed.createComponent(Host);
  setup(fixture.componentInstance);
  await fixture.whenStable();
  // Embla starts after the first render; its state renders on the next.
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const button = (label: string) => root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
  return { fixture, root, button, region: root.querySelector<HTMLElement>('pxl-carousel')! };
}

describe('PixelCarousel', () => {
  it('runs Embla on its viewport with the kit defaults, the axis of its orientation and its plugins', async () => {
    allowEmbla();
    const plugins = [plugin(4000)];
    const { root } = await render((host) => {
      host.orientation.set('vertical');
      host.opts.set({ dragFree: true });
      host.plugins.set(plugins);
    });
    const [viewport, options, given] = embla.create.mock.calls[0]!;
    expect(viewport).toBe(root.querySelector('[id$="-viewport"]'));
    expect(options).toEqual({ loop: false, align: 'start', slidesToScroll: 1, dragFree: true, axis: 'y', duration: 25 });
    expect(given).toBe(plugins);
  });

  it('scrolls without animation for a reader who prefers reduced motion', async () => {
    allowEmbla({ reducedMotion: true });
    await render();
    expect(embla.create.mock.calls[0]![1]).toMatchObject({ axis: 'x', duration: 0 });
  });

  it('scrolls from its arrows, dots and arrow keys, and shows where it is', async () => {
    allowEmbla();
    const { fixture, root, button, region } = await render();
    const api = embla.instances[0]!;
    const status = root.querySelector('[role="status"]')!;
    expect(button('Previous slide').disabled).toBe(true);
    expect(button('Next slide').disabled).toBe(false);

    button('Next slide').click();
    await fixture.whenStable();
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    expect(status.textContent).toBe('Slide 2 of 3');
    expect(button('Go to slide 2').getAttribute('aria-current')).toBe('true');
    expect(button('Previous slide').disabled).toBe(false);

    button('Go to slide 3').click();
    await fixture.whenStable();
    expect(api.scrollTo).toHaveBeenCalledWith(2);
    expect(button('Next slide').disabled).toBe(true);

    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    region.dispatchEvent(left);
    await fixture.whenStable();
    expect(left.defaultPrevented).toBe(true);
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
    expect(status.textContent).toBe('Slide 2 of 3');
    const down = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    region.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(false);
  });

  it('hands out its Embla API, then undefined and a destroyed Embla once destroyed', async () => {
    allowEmbla();
    const warn = vi.spyOn(console, 'warn');
    const { fixture } = await render();
    const api = embla.instances[0]!;
    const { handed } = fixture.componentInstance;
    expect(handed).toEqual([api]);
    expect(api.listeners('select')).toBe(1);
    fixture.destroy();
    expect(api.destroy).toHaveBeenCalledTimes(1);
    expect(handed).toEqual([api, undefined]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('re-initialises Embla when its options or plugins change in content, not when rebuilt the same', async () => {
    allowEmbla();
    const { fixture } = await render((host) => {
      host.opts.set({ loop: false });
      host.plugins.set([plugin(4000)]);
    });
    const api = embla.instances[0]!;
    const host = fixture.componentInstance;
    host.opts.set({ loop: false });
    host.plugins.set([plugin(4000)]);
    await fixture.whenStable();
    expect(api.reInit).not.toHaveBeenCalled();
    host.opts.set({ loop: true });
    await fixture.whenStable();
    expect(api.reInit).toHaveBeenCalledTimes(1);
    expect(api.reInit.mock.calls[0]![0]).toMatchObject({ loop: true });
    host.plugins.set([plugin(2000)]);
    await fixture.whenStable();
    expect(api.reInit).toHaveBeenCalledTimes(2);
    expect(embla.create).toHaveBeenCalledTimes(1);
  });

  it('stays on its first slide where Embla cannot run, the arrows enabled only when looping', async () => {
    const { fixture, root, button } = await render();
    expect(embla.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.handed).toEqual([]);
    expect(root.querySelector('[role="status"]')!.textContent).toBe('Slide 1 of 3');
    expect(root.querySelectorAll('button[aria-label^="Go to slide"]')).toHaveLength(3);
    expect(button('Next slide').disabled).toBe(true);
    fixture.componentInstance.opts.set({ loop: true });
    await fixture.whenStable();
    expect(button('Next slide').disabled).toBe(false);
  });

  it('names its slides by position as they come and go, and leaves an own label alone', async () => {
    @Component({
      imports: [PixelCarousel, PixelCarouselItem],
      template: `
        <pxl-carousel aria-label="Dynamic">
          @for (slide of slides(); track slide) {
            <pxl-carousel-item>{{ slide }}</pxl-carousel-item>
          }
          <pxl-carousel-item aria-label="The last one">Last</pxl-carousel-item>
        </pxl-carousel>
        <pxl-carousel-item>Alone</pxl-carousel-item>
      `,
    })
    class Dynamic {
      readonly slides = signal(['One', 'Two']);
    }
    const fixture = TestBed.createComponent(Dynamic);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const labels = () => Array.from(root.querySelectorAll('pxl-carousel-item'), (slide) => slide.getAttribute('aria-label'));
    expect(labels()).toEqual(['Slide 1 of 3', 'Slide 2 of 3', 'The last one', null]);
    fixture.componentInstance.slides.set(['One', 'Two', 'Three']);
    await fixture.whenStable();
    expect(labels()).toEqual(['Slide 1 of 4', 'Slide 2 of 4', 'Slide 3 of 4', 'The last one', null]);
    expect(root.querySelector('[role="status"]')!.textContent).toBe('Slide 1 of 4');
  });
});
