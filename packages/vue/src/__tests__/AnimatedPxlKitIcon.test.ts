import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { getAnimationFrame, renderIconDataUri, type AnimatedPxlKitData } from '@pxlkit/core/vanilla';
import { AnimatedPxlKitIcon } from '../index';
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

/** Index of the frame currently displayed, read back from the <img> src. */
function frameShown(wrapper: VueWrapper, icon: AnimatedPxlKitData = testAnimatedIcon): number {
  const src = wrapper.find('img').attributes('src');
  return icon.frames.findIndex((_, i) => renderIconDataUri(getAnimationFrame(icon, i)) === src);
}

async function advance(ms: number): Promise<void> {
  vi.advanceTimersByTime(ms);
  await nextTick();
}

describe('AnimatedPxlKitIcon (Vue)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an inline-flex wrapper around the frame <img>', () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: testAnimatedIcon, size: 48 } });
    const root = wrapper.element as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root.style.display).toBe('inline-flex');
    expect(root.style.width).toBe('48px');
    expect(root.style.height).toBe('48px');
    expect(root.style.lineHeight).toBe('0');
    expect(wrapper.find('img').attributes('width')).toBe('48');
  });

  it('lets class and style fall through to the wrapper', () => {
    const root = mount(AnimatedPxlKitIcon, {
      props: { icon: testAnimatedIcon },
      attrs: { class: 'my-anim', style: 'opacity: 0.5' },
    }).element as HTMLElement;
    expect(root.classList.contains('my-anim')).toBe(true);
    expect(root.style.opacity).toBe('0.5');
  });

  it('labels the frame with the icon name or aria-label', () => {
    expect(mount(AnimatedPxlKitIcon, { props: { icon: testAnimatedIcon } }).find('img').attributes('alt')).toBe('test-animated');
    expect(
      mount(AnimatedPxlKitIcon, { props: { icon: testAnimatedIcon }, attrs: { 'aria-label': 'My Animation' } })
        .find('img')
        .attributes('alt'),
    ).toBe('My Animation');
  });

  it('cycles frames in loop mode', async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'loop' } });
    const seen = [frameShown(wrapper, threeFrames)];
    for (let i = 0; i < 4; i++) {
      await advance(threeFrames.frameDuration);
      seen.push(frameShown(wrapper, threeFrames));
    }
    expect(seen).toEqual([0, 1, 2, 0, 1]);
  });

  it('ping-pongs', async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'ping-pong' } });
    const seen = [frameShown(wrapper, threeFrames)];
    for (let i = 0; i < 5; i++) {
      await advance(threeFrames.frameDuration);
      seen.push(frameShown(wrapper, threeFrames));
    }
    expect(seen).toEqual([0, 1, 2, 1, 0, 1]);
  });

  it('plays once and holds the last frame', async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'once' } });
    await advance(threeFrames.frameDuration * 6);
    expect(frameShown(wrapper, threeFrames)).toBe(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not animate when playing is false', async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: testAnimatedIcon, playing: false } });
    const html = wrapper.html();
    await advance(testAnimatedIcon.frameDuration * 3);
    expect(wrapper.html()).toBe(html);
  });

  it('only animates while hovered for trigger="hover"', async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'hover' } });
    await advance(threeFrames.frameDuration * 3);
    expect(frameShown(wrapper, threeFrames)).toBe(0);

    await wrapper.trigger('mouseenter');
    await advance(threeFrames.frameDuration);
    expect(frameShown(wrapper, threeFrames)).toBe(1);

    await wrapper.trigger('mouseleave');
    expect(frameShown(wrapper, threeFrames)).toBe(0);
    await advance(threeFrames.frameDuration * 3);
    expect(frameShown(wrapper, threeFrames)).toBe(0);
  });

  it('honours speed and fps', async () => {
    const fast = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'loop', speed: 2 } });
    await advance(threeFrames.frameDuration / 2);
    expect(frameShown(fast, threeFrames)).toBe(1);

    const fixed = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'loop', fps: 10 } });
    await advance(99);
    expect(frameShown(fixed, threeFrames)).toBe(0);
    await advance(1);
    expect(frameShown(fixed, threeFrames)).toBe(1);
  });

  it('resolves the trigger from the icon, then from the legacy loop flag', async () => {
    const once = mount(AnimatedPxlKitIcon, { props: { icon: { ...threeFrames, trigger: 'once' } } });
    await advance(threeFrames.frameDuration * 5);
    expect(frameShown(once, threeFrames)).toBe(2);

    const legacy = mount(AnimatedPxlKitIcon, { props: { icon: { ...threeFrames, loop: true } } });
    await advance(threeFrames.frameDuration * 3);
    expect(frameShown(legacy, threeFrames)).toBe(0);
  });

  it('restarts from the first frame when the icon changes', async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'loop' } });
    await advance(threeFrames.frameDuration * 2);
    expect(frameShown(wrapper, threeFrames)).toBe(2);
    const other = { ...threeFrames, name: 'other-icon' };
    await wrapper.setProps({ icon: other });
    expect(frameShown(wrapper, other)).toBe(0);
  });

  it('does not animate a single-frame icon', async () => {
    const single = { ...testAnimatedIcon, frames: [testAnimatedIcon.frames[0]] };
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: single } });
    expect(vi.getTimerCount()).toBe(0);
    const html = wrapper.html();
    await advance(single.frameDuration * 5);
    expect(wrapper.html()).toBe(html);
  });

  it('passes appearance and colour to every frame', () => {
    const src = mount(AnimatedPxlKitIcon, {
      props: { icon: testAnimatedIcon, appearance: 'solid', color: '#FF5500' },
    })
      .find('img')
      .attributes('src');
    const svg = decodeURIComponent(src!.replace(/^data:image\/svg\+xml,/, ''));
    expect(svg).toContain('fill="#FF5500"');
    expect(svg).not.toMatch(/fill="(?!#FF5500)#[0-9A-Fa-f]{6}"/);
  });

  it('stops its clock when unmounted', () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: testAnimatedIcon } });
    expect(vi.getTimerCount()).toBe(1);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('server-renders the first frame without starting a clock', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(AnimatedPxlKitIcon, { icon: testAnimatedIcon, size: 40 }) }),
    );
    expect(html).toContain(`src="${renderIconDataUri(getAnimationFrame(testAnimatedIcon, 0))}"`);
    expect(html).toContain('display:inline-flex');
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('AnimatedPxlKitIcon (Vue) — off-screen pausing', () => {
  type IOCallback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;
  let observers: Array<{ cb: IOCallback; options?: IntersectionObserverInit; targets: Element[] }>;

  beforeEach(() => {
    vi.useFakeTimers();
    observers = [];
    (globalThis as Record<string, unknown>).IntersectionObserver = class {
      record: (typeof observers)[number];
      constructor(cb: IOCallback, options?: IntersectionObserverInit) {
        this.record = { cb, options, targets: [] };
        observers.push(this.record);
      }
      observe(target: Element) {
        this.record.targets.push(target);
      }
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as Record<string, unknown>).IntersectionObserver;
  });

  it('pauses while off-screen and resumes when visible again', async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'loop' } });
    const shared = observers.find((o) => o.options?.rootMargin === '100px 0px')!;
    expect(shared.targets).toContain(wrapper.element);

    shared.cb([{ target: wrapper.element, isIntersecting: false }]);
    await advance(threeFrames.frameDuration * 3);
    expect(frameShown(wrapper, threeFrames)).toBe(0);

    shared.cb([{ target: wrapper.element, isIntersecting: true }]);
    await advance(threeFrames.frameDuration);
    expect(frameShown(wrapper, threeFrames)).toBe(1);
    wrapper.unmount();
  });

  it("plays an 'appear' icon once it is 30% visible", async () => {
    const wrapper = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'appear' } });
    await advance(threeFrames.frameDuration * 2);
    expect(frameShown(wrapper, threeFrames)).toBe(0);

    const appear = observers.find((o) => o.options?.threshold === 0.3)!;
    appear.cb([{ target: wrapper.element, isIntersecting: true }]);
    await advance(threeFrames.frameDuration * 5);
    expect(frameShown(wrapper, threeFrames)).toBe(2);
    wrapper.unmount();
  });

  it('shares one observer between every icon', () => {
    const a = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'loop' } });
    const b = mount(AnimatedPxlKitIcon, { props: { icon: threeFrames, trigger: 'ping-pong' } });
    const shared = observers.filter((o) => o.options?.rootMargin === '100px 0px');
    expect(shared).toHaveLength(1);
    expect(shared[0]!.targets).toEqual([a.element, b.element]);
    a.unmount();
    b.unmount();
  });
});
