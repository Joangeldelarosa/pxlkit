import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelGlitch } from '../../animations/PixelGlitch';
import { mockMatchMedia } from './matchmedia-mock';

/**
 * jsdom lacks native CSS animation support, so React registers the
 * vendor-prefixed `webkitAnimationEnd` event there. Dispatch both variants —
 * exactly one is registered, so the handler fires exactly once.
 */
function dispatchAnimationEnd(el: Element) {
  fireEvent.animationEnd(el);
  el.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PixelGlitch', () => {
  it('renders three copies of children when active (2 ghost layers + main)', () => {
    const { getAllByText } = render(<PixelGlitch>glitchy</PixelGlitch>);
    expect(getAllByText('glitchy')).toHaveLength(3);
  });

  it('renders its wrapper and layers as spans with as="span", the content\'s layer a block', () => {
    const { container } = render(
      <h2>
        <PixelGlitch as="span">Signal</PixelGlitch>
      </h2>,
    );
    const wrapper = container.querySelector('h2')!.firstElementChild as HTMLElement;
    expect(wrapper.tagName).toBe('SPAN');
    expect([...wrapper.children].map((layer) => layer.tagName)).toEqual(['SPAN', 'SPAN', 'SPAN']);
    expect(wrapper.querySelectorAll('[aria-hidden]')).toHaveLength(2);
    expect(wrapper.lastElementChild!.className).toBe('block');
    expect(container.querySelectorAll('div')).toHaveLength(0);
  });

  it('holds a label once and has the stylesheet draw its copies while it plays', () => {
    const { container } = render(
      <h2>
        <PixelGlitch as="span" label="Signal" intensity={6} duration={2000} />
      </h2>,
    );
    const heading = container.querySelector('h2')!;
    expect(heading.textContent).toBe('Signal');
    expect(heading.querySelectorAll('[aria-hidden]')).toHaveLength(0);
    const wrapper = heading.firstElementChild as HTMLElement;
    expect(wrapper.tagName).toBe('SPAN');
    expect(wrapper.dataset.text).toBe('Signal');
    expect(wrapper.className.split(' ')).toEqual(['relative', 'inline-block', 'overflow-visible', 'pxl-glitch-copies']);
    expect(wrapper.style.getPropertyValue('--pxl-glitch-x')).toBe('6px');
    expect(wrapper.style.getPropertyValue('--pxl-glitch-duration')).toBe('2000ms');
    const main = wrapper.firstElementChild as HTMLElement;
    expect(wrapper.children).toHaveLength(1);
    expect(main.className).toBe('block');
    expect(main.style.animation).toContain('pxl-glitch 2000ms');
  });

  it('draws no copies of a label while still: trigger off, or the user prefers reduced motion', () => {
    const { container } = render(<PixelGlitch label="idle" trigger={false} />);
    const idle = container.firstElementChild as HTMLElement;
    expect(idle.classList.contains('pxl-glitch-copies')).toBe(false);
    expect(idle.getAttribute('style')).toBeNull();
    expect(idle.dataset.text).toBe('idle');
    const ctl = mockMatchMedia(true);
    try {
      const { container: calm } = render(<PixelGlitch label="calm" />);
      const wrapper = calm.firstElementChild as HTMLElement;
      expect(wrapper.classList.contains('pxl-glitch-copies')).toBe(false);
      expect((wrapper.firstElementChild as HTMLElement).style.animation).toBe('');
      expect(wrapper.textContent).toBe('calm');
    } finally {
      ctl.restore();
    }
  });

  it('ghost layers are aria-hidden and run the R/C ghost keyframes', () => {
    const { container } = render(<PixelGlitch>x</PixelGlitch>);
    const ghosts = container.querySelectorAll('[aria-hidden]');
    expect(ghosts).toHaveLength(2);
    expect((ghosts[0] as HTMLElement).style.animation).toContain('pxl-glitch-r');
    expect((ghosts[1] as HTMLElement).style.animation).toContain('pxl-glitch-c');
  });

  it('main layer runs pxl-glitch with the default duration', () => {
    const { container } = render(<PixelGlitch>x</PixelGlitch>);
    const wrapper = container.firstElementChild as HTMLElement;
    const main = wrapper.lastElementChild as HTMLElement;
    expect(main.style.animation).toContain('pxl-glitch');
    expect(main.style.animation).toContain('3000ms');
  });

  it('intensity prop drives the --pxl-glitch-x custom property', () => {
    const { container } = render(<PixelGlitch intensity={9}>x</PixelGlitch>);
    const wrapper = container.firstElementChild as HTMLElement;
    const main = wrapper.lastElementChild as HTMLElement;
    expect(main.style.getPropertyValue('--pxl-glitch-x')).toBe('9px');
  });

  it('trigger={false} renders no ghost layers and no main animation', () => {
    const { container, getAllByText } = render(
      <PixelGlitch trigger={false}>x</PixelGlitch>,
    );
    expect(container.querySelectorAll('[aria-hidden]')).toHaveLength(0);
    expect(getAllByText('x')).toHaveLength(1);
    const wrapper = container.firstElementChild as HTMLElement;
    const main = wrapper.lastElementChild as HTMLElement;
    expect(main.style.animation).toBe('');
  });

  it('fires onComplete when the main layer animation ends', () => {
    const onComplete = vi.fn();
    const { container } = render(<PixelGlitch onComplete={onComplete}>x</PixelGlitch>);
    const wrapper = container.firstElementChild as HTMLElement;
    const main = wrapper.lastElementChild as HTMLElement;
    dispatchAnimationEnd(main);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders a single static copy (no ghost layers, no animation) when the user prefers reduced motion', () => {
    const ctl = mockMatchMedia(true);
    try {
      const { container, getAllByText } = render(<PixelGlitch>calm</PixelGlitch>);
      expect(container.querySelectorAll('[aria-hidden]')).toHaveLength(0);
      expect(getAllByText('calm')).toHaveLength(1);
      const wrapper = container.firstElementChild as HTMLElement;
      const main = wrapper.lastElementChild as HTMLElement;
      expect(main.style.animation).toBe('');
    } finally {
      ctl.restore();
    }
  });

  it('merges className onto the relative inline-block wrapper', () => {
    const { container } = render(<PixelGlitch className="custom">x</PixelGlitch>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('relative');
    expect(wrapper.className).toContain('inline-block');
    expect(wrapper.className).toContain('custom');
  });
});
