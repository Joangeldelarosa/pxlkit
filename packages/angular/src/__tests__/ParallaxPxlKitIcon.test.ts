import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import {
  ParallaxPxlKitIcon,
  parallaxContainerStyle,
  type IconAppearance,
  type ParallaxPxlKitData,
} from '@pxlkit/angular';
import {
  cssProperty,
  installAnimationFrames,
  installCanvas,
  type AnimationFrames,
  type CanvasContextStub,
} from './harness';
import { testAnimatedIcon, testParallaxIcon } from './fixtures';

@Component({
  imports: [ParallaxPxlKitIcon],
  template: `<pxl-parallax-icon
    [icon]="icon()"
    [size]="size()"
    [strength]="strength()"
    [appearance]="appearance()"
    [color]="color()"
    [smoothing]="smoothing()"
    [perspective]="perspective()"
    [layerGap]="layerGap()"
    [shadow]="shadow()"
    [interactive]="interactive()"
    [ariaLabel]="ariaLabel()"
    [decorative]="decorative()"
    (activate)="activations.push($event)"
  />`,
})
class ParallaxHost {
  readonly icon = signal<ParallaxPxlKitData>(testParallaxIcon);
  readonly size = signal<number | undefined>(undefined);
  readonly strength = signal<number | undefined>(undefined);
  readonly appearance = signal<IconAppearance | undefined>(undefined);
  readonly color = signal<string | undefined>(undefined);
  readonly smoothing = signal<number | undefined>(undefined);
  readonly perspective = signal<number | undefined>(undefined);
  readonly layerGap = signal<number | undefined>(undefined);
  readonly shadow = signal<boolean | undefined>(undefined);
  readonly interactive = signal<boolean | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly decorative = signal<boolean | undefined>(undefined);
  readonly activations: boolean[] = [];
}

@Component({
  imports: [ParallaxPxlKitIcon],
  template: `
    <pxl-parallax-icon id="attrs" [icon]="icon" size="96" layerGap="10" shadow="false" interactive="false" />
    <pxl-parallax-icon
      id="bare"
      [icon]="icon"
      interactive
      class="my-parallax"
      style="opacity: 0.7; cursor: help"
    />
  `,
})
class AttributeHost {
  readonly icon = testParallaxIcon;
}

interface Rendered {
  fixture: ComponentFixture<ParallaxHost>;
  host: HTMLElement;
  scene(): HTMLElement;
  layers(): HTMLElement[];
  transforms(): string[];
  sync(): void;
}

function render(setup: (host: ParallaxHost) => void = () => {}): Rendered {
  const fixture = TestBed.createComponent(ParallaxHost);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  const host = fixture.nativeElement.querySelector('pxl-parallax-icon') as HTMLElement;
  const scene = () => host.children[0] as HTMLElement;
  const layers = () => Array.from(scene().children) as HTMLElement[];
  return {
    fixture,
    host,
    scene,
    layers,
    transforms: () => layers().map((layer) => layer.style.transform),
    sync: () => fixture.detectChanges(),
  };
}

describe('ParallaxPxlKitIcon (Angular) — structure', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is a role="img" <pxl-parallax-icon> labelled with the icon name', () => {
    const { host } = render();
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('test-parallax');
    expect(render((h) => h.ariaLabel.set('My 3D Icon')).host.getAttribute('aria-label')).toBe('My 3D Icon');
    expect(render().host.hasAttribute('aria-hidden')).toBe(false);
  });

  it('decorative hides the container and empties the alt of every layer', () => {
    const icon = render((h) => {
      h.icon.set({ ...testParallaxIcon, layers: [...testParallaxIcon.layers, { icon: testAnimatedIcon, depth: 1 }] });
      h.ariaLabel.set('My 3D Icon');
      h.decorative.set(true);
    });
    expect(icon.host.getAttribute('aria-hidden')).toBe('true');
    expect(icon.host.hasAttribute('role')).toBe(false);
    expect(icon.host.hasAttribute('aria-label')).toBe(false);
    expect(Array.from(icon.host.querySelectorAll('img'), (img) => img.getAttribute('alt'))).toEqual(['', '', '', '']);

    icon.fixture.componentInstance.decorative.set(false);
    icon.sync();
    expect(icon.host.getAttribute('role')).toBe('img');
    expect(icon.host.getAttribute('aria-label')).toBe('My 3D Icon');
    expect(icon.host.hasAttribute('aria-hidden')).toBe(false);
  });

  it('binds every container style of the engine, deriving perspective from the size', () => {
    for (const interactive of [true, false]) {
      const { host } = render((h) => {
        h.size.set(100);
        h.interactive.set(interactive);
      });
      const expected = parallaxContainerStyle({ size: 100, perspective: 250, interactive });
      expect(host.style.length).toBe(Object.keys(expected).length);
      for (const [property, value] of Object.entries(expected)) {
        expect(host.style.getPropertyValue(cssProperty(property))).toBe(value);
      }
    }
    expect(render((h) => h.perspective.set(500)).host.style.perspective).toBe('500px');
    expect(render().host.style.width).toBe('64px');
  });

  it('accepts attribute values and merges class and style into the container', () => {
    const fixture = TestBed.createComponent(AttributeHost);
    fixture.detectChanges();
    const attrs = fixture.nativeElement.querySelector('#attrs') as HTMLElement;
    expect(attrs.style.width).toBe('96px');
    expect(attrs.querySelector('canvas')).toBeNull();
    expect(attrs.style.cursor).toBe('');
    const layers = Array.from(attrs.children[0]!.children) as HTMLElement[];
    expect(layers.every((layer) => layer.style.filter === '')).toBe(true);

    const bare = fixture.nativeElement.querySelector('#bare') as HTMLElement;
    expect(bare.querySelector('canvas')).not.toBeNull();
    expect(bare.classList.contains('my-parallax')).toBe(true);
    expect(bare.style.opacity).toBe('0.7');
    expect(bare.style.cursor).toBe('help'); // consumer style wins
  });

  it('renders a preserve-3d scene with one inert layer per icon layer', () => {
    const icon = render();
    expect(icon.scene().style.transformStyle).toBe('preserve-3d');
    expect(icon.layers()).toHaveLength(3);
    for (const layer of icon.layers()) {
      expect(layer.style.pointerEvents).toBe('none');
      expect(layer.style.willChange).toBe('transform');
    }
    expect(icon.host.querySelectorAll('img')).toHaveLength(3);
  });

  it('renders animated layers with <pxl-animated-icon>', () => {
    const icon = render((h) =>
      h.icon.set({
        ...testParallaxIcon,
        layers: [{ icon: testAnimatedIcon, depth: 1 }, testParallaxIcon.layers[1]!],
      }),
    );
    expect(icon.layers()[0]!.firstElementChild!.tagName).toBe('PXL-ANIMATED-ICON');
    expect(icon.host.querySelectorAll('img')).toHaveLength(2);
  });

  it('casts depth shadows on every layer but the back one, unless disabled', () => {
    const withShadow = render().layers();
    expect(withShadow[0]!.style.filter).toBe('');
    expect(withShadow[1]!.style.filter).toContain('drop-shadow');
    expect(render((h) => h.shadow.set(false)).layers()[1]!.style.filter).toBe('');
  });

  it('applies the resting stack depth on mount', () => {
    expect(render().transforms()).toEqual(['translateZ(0px)', 'translateZ(0px)', 'translateZ(0px)']);
  });

  it('renders a size×size particle canvas only when interactive', () => {
    const interactive = render((h) => h.size.set(96));
    const canvas = interactive.host.querySelector('canvas')!;
    expect(canvas.getAttribute('width')).toBe('96');
    expect(canvas.getAttribute('height')).toBe('96');
    expect(interactive.host.style.cursor).toBe('pointer');
    const inert = render((h) => h.interactive.set(false));
    expect(inert.host.querySelector('canvas')).toBeNull();
    expect(inert.host.style.cursor).toBe('');
  });

  it('falls back to the defaults for inputs bound to undefined', () => {
    const icon = render((h) => {
      h.size.set(80);
      h.shadow.set(false);
      h.interactive.set(false);
    });
    icon.fixture.componentInstance.size.set(undefined);
    icon.fixture.componentInstance.shadow.set(undefined);
    icon.fixture.componentInstance.interactive.set(undefined);
    icon.sync();
    expect(icon.host.style.width).toBe('64px');
    expect(icon.layers()[1]!.style.filter).toContain('drop-shadow');
    expect(icon.host.querySelector('canvas')).not.toBeNull();
  });
});

describe('ParallaxPxlKitIcon (Angular) — motion', () => {
  let frames: AnimationFrames;
  let canvas: CanvasContextStub;

  beforeEach(() => {
    frames = installAnimationFrames();
    canvas = installCanvas();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const resting = ['translateZ(-20px)', 'translateZ(0px)', 'translateZ(20px)'];

  it('peels apart, explodes on click and springs back — re-renders never reset the depth', () => {
    const icon = render((h) => h.layerGap.set(20));
    frames.step(60);
    expect(icon.transforms()).toEqual(resting);

    icon.host.click(); // re-renders the scene (active hue-shift)
    icon.sync();
    frames.step(1);
    expect(Number(/-?[\d.]+/.exec(icon.transforms()[0]!)![0])).toBeLessThan(-40);

    icon.fixture.componentInstance.shadow.set(false); // another re-render mid-burst
    icon.sync();
    frames.step(200);
    expect(icon.transforms()).toEqual(resting);
  });

  it('tilts the scene toward the page-wide mouse position', () => {
    const icon = render();
    const rect = DOMRect.fromRect({ x: 300, y: 300, width: 64, height: 64 });
    vi.spyOn(icon.host, 'getBoundingClientRect').mockReturnValue(rect);
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: window.innerWidth, clientY: 0 }));
    frames.step(120);
    const [, x, y] = /rotateX\((-?[\d.]+)deg\) rotateY\((-?[\d.]+)deg\)/.exec(icon.scene().style.transform)!;
    expect(Number(x)).toBeGreaterThan(0); // pointer above → tilts back
    expect(Number(y)).toBeGreaterThan(0); // pointer to the right → turns right
  });

  it('toggles the active hue-shift and emits activate', () => {
    const icon = render();
    icon.host.click();
    icon.sync();
    expect(icon.scene().style.filter).toBe('hue-rotate(30deg) saturate(1.3)');
    icon.host.click();
    icon.sync();
    expect(icon.scene().style.filter).toBe('');
    expect(icon.fixture.componentInstance.activations).toEqual([true, false]);
  });

  it('bursts pixel particles on its canvas when clicked', () => {
    const icon = render();
    frames.step(5);
    expect(canvas.fillRect).not.toHaveBeenCalled();
    icon.host.click();
    frames.step(1);
    expect(canvas.fillRect).toHaveBeenCalled();
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
    frames.step(80); // the particles die out and the canvas is cleared
    const draws = canvas.fillRect.mock.calls.length;
    frames.step(5);
    expect(canvas.fillRect.mock.calls.length).toBe(draws);
  });

  it('ignores clicks when not interactive', () => {
    const icon = render((h) => h.interactive.set(false));
    icon.host.click();
    icon.sync();
    expect(icon.fixture.componentInstance.activations).toEqual([]);
    expect(icon.scene().style.filter).toBe('');
  });

  it('applies a new layer gap without replaying the intro', () => {
    const icon = render((h) => h.layerGap.set(20));
    frames.step(60);
    icon.fixture.componentInstance.layerGap.set(10);
    icon.sync();
    frames.step(1);
    expect(icon.transforms()[0]).toBe('translateZ(-10px)');
  });

  it('replays the intro for a new icon and animates its layers', () => {
    const icon = render((h) => h.layerGap.set(20));
    frames.step(60);
    const twoLayers: ParallaxPxlKitData = {
      ...testParallaxIcon,
      name: 'two',
      layers: testParallaxIcon.layers.slice(0, 2),
    };
    icon.fixture.componentInstance.icon.set(twoLayers);
    icon.sync();
    expect(icon.layers()).toHaveLength(2);
    frames.step(1);
    expect(Math.abs(Number(/-?[\d.]+/.exec(icon.transforms()[0]!)![0]))).toBeLessThan(10); // intro restarted
    frames.step(60);
    expect(icon.transforms()).toEqual(['translateZ(-10px)', 'translateZ(10px)']);
    expect(icon.host.getAttribute('aria-label')).toBe('two');
  });

  it('swaps the particle canvas when interactive toggles', () => {
    const icon = render();
    icon.fixture.componentInstance.interactive.set(false);
    icon.sync();
    expect(icon.host.querySelector('canvas')).toBeNull();
    icon.host.click();
    expect(() => frames.step(3)).not.toThrow();
    expect(canvas.fillRect).not.toHaveBeenCalled(); // no canvas, no particles
    icon.fixture.componentInstance.interactive.set(true);
    icon.sync();
    expect(icon.host.querySelector('canvas')).not.toBeNull();
    icon.host.click();
    frames.step(1);
    expect(canvas.fillRect).toHaveBeenCalled(); // the new canvas is drawn on
  });

  it('stops the animation loop and the mouse tracking when destroyed', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const icon = render();
    frames.step(2);
    icon.fixture.destroy();
    frames.step(1); // flush anything queued before the teardown
    expect(frames.pending).toBe(0);
    expect(removeListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });
});
