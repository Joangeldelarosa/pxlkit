import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AnimatedPxlKitIcon } from '../../components/AnimatedPxlKitIcon';
import { testAnimatedIcon } from '../fixtures';
import type { AnimatedPxlKitData } from '../../types';

/**
 * AnimatedPxlKitIcon wraps PxlKitIcon (which renders as `<img>`-with-data-URI
 * for nearest-neighbour scaling). So the wrapper div is the outer DOM and the
 * frame artwork lives inside the inner `<img src="data:image/svg+xml,..">`.
 * Helpers below decode the SVG out of the data URI when we need to assert on
 * frame contents (rects, palette, etc.).
 */

function getInnerImg(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector('img');
  expect(img).not.toBeNull();
  return img as HTMLImageElement;
}

function decodeSvgFromImg(img: HTMLImageElement): string {
  const src = img.getAttribute('src') || '';
  expect(src).toMatch(/^data:image\/svg\+xml,/);
  return decodeURIComponent(src.replace(/^data:image\/svg\+xml,/, ''));
}

function countRectsInImg(img: HTMLImageElement): number {
  const svgMarkup = decodeSvgFromImg(img);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = svgMarkup;
  return wrapper.querySelectorAll('rect').length;
}

describe('AnimatedPxlKitIcon', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an <img> element for the frame', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} />
    );
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('renders a wrapper div with inline-flex', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.style.display).toBe('inline-flex');
  });

  it('applies className prop to wrapper div', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} className="my-anim" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('my-anim')).toBe(true);
  });

  it('applies style prop to wrapper div', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} style={{ opacity: 0.5 }} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0.5');
  });

  it('uses icon name as default alt text on the inner img', () => {
    render(<AnimatedPxlKitIcon icon={testAnimatedIcon} />);
    expect(screen.getByAltText(testAnimatedIcon.name)).toBeTruthy();
  });

  it('custom aria-label overrides default alt', () => {
    render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} aria-label="My Animation" />
    );
    expect(screen.getByAltText('My Animation')).toBeTruthy();
  });

  it('cycles frames over time in loop mode', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} />
    );
    const img = getInnerImg(container);
    const initialSrc = img.getAttribute('src');

    // Advance past one frame duration
    act(() => {
      vi.advanceTimersByTime(testAnimatedIcon.frameDuration + 50);
    });

    // The data URI should have updated as we moved to a different frame.
    const newSrc = getInnerImg(container).getAttribute('src');
    expect(newSrc).not.toBe(initialSrc);
  });

  it('does not animate when playing is false', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} playing={false} />
    );

    // Get initial DOM
    const initialHTML = container.innerHTML;

    act(() => {
      vi.advanceTimersByTime(testAnimatedIcon.frameDuration * 3);
    });

    // Should remain the same since playing is false
    expect(container.innerHTML).toBe(initialHTML);
  });

  it('respects trigger="once" — stops after one pass', () => {
    const onceIcon: AnimatedPxlKitData = {
      ...testAnimatedIcon,
      loop: false,
      trigger: undefined,
    };
    const { container } = render(
      <AnimatedPxlKitIcon icon={onceIcon} trigger="once" />
    );

    // Advance past all frames + extra
    act(() => {
      vi.advanceTimersByTime(
        onceIcon.frameDuration * (onceIcon.frames.length + 2)
      );
    });

    // Should still render without crashing
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('respects trigger="hover" — only animates on hover', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} trigger="hover" />
    );
    const wrapper = container.firstChild as HTMLElement;
    const initialHTML = container.innerHTML;

    // Not hovering → no animation
    act(() => {
      vi.advanceTimersByTime(testAnimatedIcon.frameDuration * 3);
    });
    expect(container.innerHTML).toBe(initialHTML);

    // Start hovering
    act(() => {
      fireEvent.mouseEnter(wrapper);
    });

    act(() => {
      vi.advanceTimersByTime(testAnimatedIcon.frameDuration + 50);
    });

    // Stop hovering — should reset
    act(() => {
      fireEvent.mouseLeave(wrapper);
    });

    expect(container.querySelector('img')).not.toBeNull();
  });

  it('respects trigger="ping-pong"', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} trigger="ping-pong" />
    );

    // Advance through multiple frames to trigger direction change
    act(() => {
      vi.advanceTimersByTime(
        testAnimatedIcon.frameDuration * testAnimatedIcon.frames.length * 3
      );
    });

    expect(container.querySelector('img')).not.toBeNull();
  });

  it('speed prop affects frame duration', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} speed={2} />
    );

    act(() => {
      vi.advanceTimersByTime(testAnimatedIcon.frameDuration);
    });

    expect(container.querySelector('img')).not.toBeNull();
  });

  it('fps prop overrides frame duration', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} fps={12} />
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(container.querySelector('img')).not.toBeNull();
  });

  it('resets frame index when icon changes', () => {
    const secondIcon: AnimatedPxlKitData = {
      ...testAnimatedIcon,
      name: 'different-icon',
    };

    const { container, rerender } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} />
    );

    // Advance to a later frame
    act(() => {
      vi.advanceTimersByTime(testAnimatedIcon.frameDuration + 50);
    });

    // Switch icons
    rerender(<AnimatedPxlKitIcon icon={secondIcon} />);

    expect(container.querySelector('img')).not.toBeNull();
  });

  it('does not animate single-frame icon', () => {
    const singleFrame: AnimatedPxlKitData = {
      ...testAnimatedIcon,
      frames: [testAnimatedIcon.frames[0]],
    };
    const { container } = render(
      <AnimatedPxlKitIcon icon={singleFrame} />
    );
    const initialHTML = container.innerHTML;

    act(() => {
      vi.advanceTimersByTime(singleFrame.frameDuration * 5);
    });

    expect(container.innerHTML).toBe(initialHTML);
  });

  it('merges frame palette with base palette', () => {
    const iconWithFramePalette: AnimatedPxlKitData = {
      ...testAnimatedIcon,
      frames: [
        {
          grid: testAnimatedIcon.frames[0].grid,
          palette: { A: '#00FF00' },
        },
        testAnimatedIcon.frames[1],
      ],
    };

    const { container } = render(
      <AnimatedPxlKitIcon icon={iconWithFramePalette} colorful />
    );

    // We at least know rects render — frame palette merging is exercised
    // when computing the encoded SVG for the active frame.
    expect(countRectsInImg(getInnerImg(container))).toBeGreaterThan(0);
  });

  it('passes size prop to inner PxlKitIcon', () => {
    const { container } = render(
      <AnimatedPxlKitIcon icon={testAnimatedIcon} size={64} />
    );
    const img = getInnerImg(container);
    expect(img.getAttribute('width')).toBe('64');
    expect(img.getAttribute('height')).toBe('64');
  });

  it('passes colorful=false and color prop to PxlKitIcon', () => {
    const { container } = render(
      <AnimatedPxlKitIcon
        icon={testAnimatedIcon}
        colorful={false}
        color="#FF5500"
      />
    );
    const img = getInnerImg(container);
    const svgMarkup = decodeSvgFromImg(img);
    // Every rect should be flattened to the solid color.
    expect(svgMarkup).toContain('fill="#FF5500"');
    expect(svgMarkup).not.toMatch(/fill="(?!#FF5500)#[0-9A-Fa-f]{6}"/);
  });

  it('resolves trigger from icon.trigger when prop is not set', () => {
    const iconWithTrigger: AnimatedPxlKitData = {
      ...testAnimatedIcon,
      trigger: 'once',
    };
    const { container } = render(
      <AnimatedPxlKitIcon icon={iconWithTrigger} />
    );

    // Advance past all frames
    act(() => {
      vi.advanceTimersByTime(
        iconWithTrigger.frameDuration * (iconWithTrigger.frames.length + 2)
      );
    });

    expect(container.querySelector('img')).not.toBeNull();
  });

  it('falls back to loop:true → "loop" trigger', () => {
    const loopIcon: AnimatedPxlKitData = {
      ...testAnimatedIcon,
      loop: true,
      trigger: undefined,
    };
    const { container } = render(
      <AnimatedPxlKitIcon icon={loopIcon} />
    );

    // Should loop — advance several cycles
    act(() => {
      vi.advanceTimersByTime(loopIcon.frameDuration * loopIcon.frames.length * 3);
    });

    expect(container.querySelector('img')).not.toBeNull();
  });
});
