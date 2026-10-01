import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component, afterEveryRender, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import {
  AnimatedPxlKitIcon,
  animatedIconWrapperStyle,
  type AnimatedPxlKitData,
  type AnimationTrigger,
  type IconAppearance,
} from '@pxlkit/angular';
import { cssProperty, decodeSvg, frameShown, installIntersectionObservers } from './harness';
import { testAnimatedIcon } from './fixtures';

/** Three visually distinct frames, so the displayed index can be read back from the DOM. */
const threeFrames: AnimatedPxlKitData = {
  ...testAnimatedIcon,
  name: 'three-frames',
  frames: [
    testAnimatedIcon.frames[0],
    testAnimatedIcon.frames[1],
    { grid: ['A.......', ...testAnimatedIcon.frames[0].grid.slice(1)] },
  ],
};

@Component({
  imports: [AnimatedPxlKitIcon],
  template: `<pxl-animated-icon
    [icon]="icon()"
    [size]="size()"
    [appearance]="appearance()"
    [color]="color()"
    [playing]="playing()"
    [trigger]="trigger()"
    [speed]="speed()"
    [fps]="fps()"
    [ariaLabel]="ariaLabel()"
  />`,
})
class AnimatedHost {
  readonly icon = signal<AnimatedPxlKitData>(threeFrames);
  readonly size = signal<number | undefined>(undefined);
  readonly appearance = signal<IconAppearance | undefined>(undefined);
  readonly color = signal<string | undefined>(undefined);
  readonly playing = signal<boolean | undefined>(undefined);
  readonly trigger = signal<AnimationTrigger | undefined>(undefined);
  readonly speed = signal<number | undefined>(undefined);
  readonly fps = signal<number | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
  /** Change detection passes so far. */
  renders = 0;

  constructor() {
    afterEveryRender(() => this.renders++);
  }
}

@Component({
  imports: [AnimatedPxlKitIcon],
  template: `<pxl-animated-icon
    [icon]="icon"
    size="40"
    playing
    fps="10"
    class="my-anim"
    style="opacity: 0.5; display: flex"
  />`,
})
class AttributeHost {
  readonly icon = threeFrames;
}

interface Rendered {
  fixture: ComponentFixture<AnimatedHost>;
  host: HTMLElement;
  img: HTMLImageElement;
  /** Index of the frame on screen. */
  frame(): number;
}

function render(setup: (host: AnimatedHost) => void = () => {}): Rendered {
  const fixture = TestBed.createComponent(AnimatedHost);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  const host = fixture.nativeElement.querySelector('pxl-animated-icon') as HTMLElement;
  const img = host.querySelector('img') as HTMLImageElement;
  return { fixture, host, img, frame: () => frameShown(img, fixture.componentInstance.icon()) };
}

/**
 * Advances the (fake) clock by `ms` — letting microtasks run between timers,
 * as in a browser event loop — then syncs the view.
 */
async function advance(fixture: ComponentFixture<unknown>, ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  fixture.detectChanges();
}

describe('AnimatedPxlKitIcon (Angular)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is an inline-flex <pxl-animated-icon> box around the frame <img>', () => {
    const { host, img } = render((h) => h.size.set(48));
    for (const [property, value] of Object.entries(animatedIconWrapperStyle(48))) {
      expect(host.style.getPropertyValue(cssProperty(property))).toBe(value);
    }
    expect(img.getAttribute('width')).toBe('48');
    expect(img.getAttribute('height')).toBe('48');
    expect(img.style.imageRendering).toBe('pixelated');
    expect(img.getAttribute('draggable')).toBe('false');
  });

  it('accepts attribute values and merges class and style into the box', async () => {
    const fixture = TestBed.createComponent(AttributeHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('pxl-animated-icon') as HTMLElement;
    expect(host.style.width).toBe('40px');
    expect(host.classList.contains('my-anim')).toBe(true);
    expect(host.style.opacity).toBe('0.5');
    expect(host.style.display).toBe('flex'); // consumer style wins
    const img = host.querySelector('img')!;
    await advance(fixture, 100); // fps="10" → 100 ms frames, `playing` forces playback
    expect(frameShown(img, threeFrames)).toBe(1);
  });

  it('labels the frame with the icon name or ariaLabel', () => {
    expect(render().img.getAttribute('alt')).toBe('three-frames');
    expect(render((h) => h.ariaLabel.set('My Animation')).img.getAttribute('alt')).toBe('My Animation');
  });

  it('paints each frame straight to the image, without change detection', async () => {
    const icon = render((h) => h.trigger.set('loop'));
    const rendersBefore = icon.fixture.componentInstance.renders;
    await vi.advanceTimersByTimeAsync(threeFrames.frameDuration);
    expect(icon.frame()).toBe(1);
    await vi.advanceTimersByTimeAsync(threeFrames.frameDuration);
    expect(icon.frame()).toBe(2);
    expect(icon.fixture.componentInstance.renders).toBe(rendersBefore);
    icon.fixture.componentInstance.size.set(20); // an input change does render
    await vi.advanceTimersByTimeAsync(20);
    expect(icon.fixture.componentInstance.renders).toBeGreaterThan(rendersBefore);
    expect(icon.frame()).toBe(2);
  });

  it('cycles frames in loop mode', async () => {
    const icon = render((h) => h.trigger.set('loop'));
    const seen = [icon.frame()];
    for (let i = 0; i < 4; i++) {
      await advance(icon.fixture, threeFrames.frameDuration);
      seen.push(icon.frame());
    }
    expect(seen).toEqual([0, 1, 2, 0, 1]);
  });

  it('ping-pongs', async () => {
    const icon = render((h) => h.trigger.set('ping-pong'));
    const seen = [icon.frame()];
    for (let i = 0; i < 5; i++) {
      await advance(icon.fixture, threeFrames.frameDuration);
      seen.push(icon.frame());
    }
    expect(seen).toEqual([0, 1, 2, 1, 0, 1]);
  });

  it('plays once and holds the last frame', async () => {
    const icon = render((h) => h.trigger.set('once'));
    await advance(icon.fixture, threeFrames.frameDuration * 6);
    expect(icon.frame()).toBe(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not animate when playing is false', async () => {
    const icon = render((h) => h.playing.set(false));
    await advance(icon.fixture, threeFrames.frameDuration * 3);
    expect(icon.frame()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('only animates while hovered for trigger="hover"', async () => {
    const icon = render((h) => h.trigger.set('hover'));
    await advance(icon.fixture, threeFrames.frameDuration * 3);
    expect(icon.frame()).toBe(0);

    icon.host.dispatchEvent(new MouseEvent('mouseenter'));
    await advance(icon.fixture, threeFrames.frameDuration);
    expect(icon.frame()).toBe(1);

    icon.host.dispatchEvent(new MouseEvent('mouseleave'));
    await advance(icon.fixture, 0);
    expect(icon.frame()).toBe(0);
    await advance(icon.fixture, threeFrames.frameDuration * 3);
    expect(icon.frame()).toBe(0);
  });

  it('honours speed and fps', async () => {
    const fast = render((h) => {
      h.trigger.set('loop');
      h.speed.set(2);
    });
    await advance(fast.fixture, threeFrames.frameDuration / 2);
    expect(fast.frame()).toBe(1);

    const fixed = render((h) => {
      h.trigger.set('loop');
      h.fps.set(10);
    });
    await advance(fixed.fixture, 99);
    expect(fixed.frame()).toBe(0);
    await advance(fixed.fixture, 1);
    expect(fixed.frame()).toBe(1);
  });

  it('resolves the trigger from the icon, then from the legacy loop flag', async () => {
    const once = render((h) => h.icon.set({ ...threeFrames, trigger: 'once' }));
    await advance(once.fixture, threeFrames.frameDuration * 5);
    expect(once.frame()).toBe(2);
    once.fixture.destroy();

    const legacy = render((h) => h.icon.set({ ...threeFrames, loop: true }));
    await advance(legacy.fixture, threeFrames.frameDuration * 3);
    expect(legacy.frame()).toBe(0);
  });

  it('restarts from the first frame when the icon changes, without painting a stale frame', async () => {
    const icon = render((h) => h.trigger.set('loop'));
    await advance(icon.fixture, threeFrames.frameDuration * 2);
    expect(icon.frame()).toBe(2);
    const other = { ...threeFrames, name: 'other-icon' };
    icon.fixture.componentInstance.icon.set(other);
    icon.fixture.detectChanges(); // one synchronous pass: the very first paint of `other`
    expect(frameShown(icon.img, other)).toBe(0);
    expect(icon.img.getAttribute('alt')).toBe('other-icon');
  });

  it('applies a new trigger or timing to the running clock', async () => {
    const icon = render((h) => h.trigger.set('loop'));
    await advance(icon.fixture, threeFrames.frameDuration);
    expect(icon.frame()).toBe(1);
    icon.fixture.componentInstance.fps.set(20); // 50 ms frames
    await advance(icon.fixture, 50);
    expect(icon.frame()).toBe(2);
    icon.fixture.componentInstance.playing.set(false);
    await advance(icon.fixture, threeFrames.frameDuration * 3);
    expect(icon.frame()).toBe(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not animate a single-frame icon', async () => {
    const icon = render((h) => h.icon.set({ ...testAnimatedIcon, frames: [testAnimatedIcon.frames[0]] }));
    expect(vi.getTimerCount()).toBe(0);
    const src = icon.img.getAttribute('src');
    await advance(icon.fixture, testAnimatedIcon.frameDuration * 5);
    expect(icon.img.getAttribute('src')).toBe(src);
  });

  it('passes appearance and colour to every frame', async () => {
    const icon = render((h) => {
      h.appearance.set('solid');
      h.color.set('#FF5500');
    });
    for (let i = 0; i < threeFrames.frames.length; i++) {
      const svg = decodeSvg(icon.img);
      expect(svg).toContain('fill="#FF5500"');
      expect(svg).not.toMatch(/fill="(?!#FF5500)#[0-9A-Fa-f]{6}"/);
      await advance(icon.fixture, threeFrames.frameDuration);
    }
  });

  it('falls back to the defaults for inputs bound to undefined', async () => {
    const icon = render((h) => {
      h.size.set(50);
      h.trigger.set('once');
      h.speed.set(4);
    });
    icon.fixture.componentInstance.size.set(undefined);
    icon.fixture.componentInstance.trigger.set(undefined); // back to the icon's own (looping) trigger
    icon.fixture.componentInstance.speed.set(undefined);
    await advance(icon.fixture, 0);
    expect(icon.host.style.width).toBe('32px');
    await advance(icon.fixture, threeFrames.frameDuration * 4);
    expect(icon.frame()).toBe(1);
  });

  it('stops its clock when destroyed', () => {
    const icon = render();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    icon.fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('AnimatedPxlKitIcon (Angular) — off-screen pausing', () => {
  let observers: ReturnType<typeof installIntersectionObservers>;

  beforeEach(() => {
    vi.useFakeTimers();
    observers = installIntersectionObservers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('pauses while off-screen and resumes when visible again', async () => {
    const icon = render((h) => h.trigger.set('loop'));
    const shared = observers.find((o) => o.options?.rootMargin === '100px 0px')!;
    expect(shared.targets).toContain(icon.host);

    shared.callback([{ target: icon.host, isIntersecting: false }]);
    await advance(icon.fixture, threeFrames.frameDuration * 3);
    expect(icon.frame()).toBe(0);

    shared.callback([{ target: icon.host, isIntersecting: true }]);
    await advance(icon.fixture, threeFrames.frameDuration);
    expect(icon.frame()).toBe(1);
  });

  it("plays an 'appear' icon once it is 30% visible", async () => {
    const icon = render((h) => h.trigger.set('appear'));
    await advance(icon.fixture, threeFrames.frameDuration * 2);
    expect(icon.frame()).toBe(0);

    const appear = observers.find((o) => o.options?.threshold === 0.3)!;
    expect(appear.targets).toContain(icon.host);
    appear.callback([{ target: icon.host, isIntersecting: true }]);
    await advance(icon.fixture, threeFrames.frameDuration * 5);
    expect(icon.frame()).toBe(2);
  });

  it('shares one observer between every icon and releases it on destroy', () => {
    const a = render((h) => h.trigger.set('loop'));
    const b = render((h) => h.trigger.set('ping-pong'));
    const shared = observers.filter((o) => o.options?.rootMargin === '100px 0px');
    expect(shared).toHaveLength(1);
    expect(shared[0]!.targets).toEqual([a.host, b.host]);
    a.fixture.destroy();
    b.fixture.destroy();
    expect(shared[0]!.targets).toEqual([]);
  });
});
