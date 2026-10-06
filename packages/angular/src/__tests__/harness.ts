import { vi } from 'vitest';
import { getAnimationFrame, renderIconDataUri, type AnimatedPxlKitData } from '@pxlkit/angular';

/** CSS property name of a camelCase style key (`flexShrink` → `flex-shrink`). */
export const cssProperty = (key: string): string => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Decoded SVG document behind an icon `<img>`. */
export function decodeSvg(img: Element): string {
  const src = img.getAttribute('src') ?? '';
  if (!src.startsWith('data:image/svg+xml,')) throw new Error(`not an SVG data URI: ${src}`);
  return decodeURIComponent(src.slice('data:image/svg+xml,'.length));
}

/** Parsed `<svg>` element behind an icon `<img>`. */
export function svgOf(img: Element): SVGSVGElement {
  const host = document.createElement('div');
  host.innerHTML = decodeSvg(img);
  return host.querySelector('svg') as SVGSVGElement;
}

/** Index of the frame an `<img>` shows, read back from its src (`-1` if none). */
export function frameShown(img: Element, icon: AnimatedPxlKitData): number {
  const src = img.getAttribute('src');
  return icon.frames.findIndex((_, i) => renderIconDataUri(getAnimationFrame(icon, i)) === src);
}

/**
 * Manual `requestAnimationFrame` clock (with a matching `performance.now`).
 * Callbacks are tracked by id, so cancelling one — Angular's zoneless
 * scheduler races a frame against a timeout and cancels the loser — leaves
 * the others queued.
 */
export interface AnimationFrames {
  /** Callbacks waiting for the next frame. */
  readonly pending: number;
  /** Runs `count` frames, 16 ms apart. */
  step(count?: number): void;
}

export function installAnimationFrames(): AnimationFrames {
  let now = 0;
  let nextId = 0;
  const queue = new Map<number, FrameRequestCallback>();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    queue.set(++nextId, callback);
    return nextId;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    queue.delete(id);
  });
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  return {
    get pending() {
      return queue.size;
    },
    step(count = 1) {
      for (let i = 0; i < count; i++) {
        now += 16;
        const due = Array.from(queue.values());
        queue.clear();
        for (const callback of due) callback(now);
      }
    },
  };
}

/** Recording 2D context handed out by every canvas (jsdom has no canvas implementation). */
export interface CanvasContextStub {
  readonly clearRect: ReturnType<typeof vi.fn>;
  readonly fillRect: ReturnType<typeof vi.fn>;
  globalAlpha: number;
  fillStyle: string;
}

export function installCanvas(): CanvasContextStub {
  const context: CanvasContextStub = { clearRect: vi.fn(), fillRect: vi.fn(), globalAlpha: 1, fillStyle: '' };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    (() => context) as unknown as HTMLCanvasElement['getContext'],
  );
  return context;
}

/** Records every IntersectionObserver the components create. */
export interface ObserverRecord {
  readonly callback: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;
  readonly options: IntersectionObserverInit | undefined;
  readonly targets: Element[];
}

export function installIntersectionObservers(): ObserverRecord[] {
  const observers: ObserverRecord[] = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private readonly record: ObserverRecord;
      constructor(callback: ObserverRecord['callback'], options?: IntersectionObserverInit) {
        this.record = { callback, options, targets: [] };
        observers.push(this.record);
      }
      observe(target: Element): void {
        this.record.targets.push(target);
      }
      unobserve(target: Element): void {
        this.record.targets.splice(this.record.targets.indexOf(target), 1);
      }
      disconnect(): void {
        this.record.targets.length = 0;
      }
    },
  );
  return observers;
}
