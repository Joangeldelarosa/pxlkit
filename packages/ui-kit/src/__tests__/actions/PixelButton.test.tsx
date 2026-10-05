import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelButton } from '../../actions';

describe('PixelButton — variant upgrades', () => {
  it('renders solid variant (default) with tone bg class', () => {
    const { getByRole } = render(<PixelButton tone="green">Go</PixelButton>);
    const btn = getByRole('button');
    // solid uses tone.bg, which contains `bg-retro-green/18`
    expect(btn.className).toContain('bg-retro-green/18');
  });

  it('renders soft variant with tone.soft', () => {
    const { getByRole } = render(
      <PixelButton tone="green" variant="soft">Go</PixelButton>,
    );
    const btn = getByRole('button');
    expect(btn.className).toContain('bg-retro-green/8');
  });

  it('renders outline variant with transparent bg + border', () => {
    const { getByRole } = render(
      <PixelButton tone="cyan" variant="outline">Go</PixelButton>,
    );
    const btn = getByRole('button');
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('border-retro-cyan/40');
  });

  it('renders ghost variant with transparent bg, no surface border', () => {
    const { getByRole } = render(
      <PixelButton tone="purple" variant="ghost">Go</PixelButton>,
    );
    const btn = getByRole('button');
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('border-transparent');
  });
});

describe('PixelButton — fullWidth', () => {
  it('applies w-full when fullWidth is true', () => {
    const { getByRole } = render(<PixelButton fullWidth>Go</PixelButton>);
    expect(getByRole('button').className).toContain('w-full');
  });

  it('omits w-full when fullWidth is unset', () => {
    const { getByRole } = render(<PixelButton>Go</PixelButton>);
    expect(getByRole('button').className).not.toContain('w-full');
  });
});

describe('PixelButton — loading min-width pin', () => {
  it('pins min-width on the inline style when flipping into loading', () => {
    // jsdom returns 0 width unless we stub getBoundingClientRect.
    const origGBCR = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
      x: 0, y: 0, width: 123, height: 32, top: 0, left: 0, right: 123, bottom: 32, toJSON: () => ({}),
    }));
    try {
      const { getByRole, rerender } = render(<PixelButton>Save changes now</PixelButton>);
      const btn = getByRole('button') as HTMLButtonElement;
      expect(btn.style.minWidth).toBe('');
      rerender(<PixelButton loading>Save changes now</PixelButton>);
      expect(btn.style.minWidth).toBe('123px');
      // When loading clears, the pin is released.
      rerender(<PixelButton>Save changes now</PixelButton>);
      expect(btn.style.minWidth).toBe('');
    } finally {
      HTMLElement.prototype.getBoundingClientRect = origGBCR;
    }
  });

  it('renders the spinner while loading and force-disables', () => {
    const { getByRole, getByTestId } = render(
      <PixelButton loading>Save</PixelButton>,
    );
    expect(getByTestId('pxl-button-spinner')).toBeTruthy();
    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('PixelButton — asChild', () => {
  it('clones a single child anchor, merges className + onClick + ref', () => {
    const childClick = vi.fn();
    const wrapperClick = vi.fn();
    const externalRef = React.createRef<HTMLAnchorElement>();
    function Harness() {
      // forwardRef accepts the ref from forwardRef<HTMLButtonElement>, but
      // because asChild clones the child, we attach the ref through the child
      // via the consumer (using mergeRefs equivalent inside the impl).
      return (
        <PixelButton
          asChild
          tone="cyan"
          variant="outline"
          onClick={wrapperClick}
          ref={externalRef as unknown as React.Ref<HTMLButtonElement>}
        >
          <a href="/foo" className="custom-class" onClick={childClick} data-testid="slot-link">
            Go
          </a>
        </PixelButton>
      );
    }
    const { getByTestId, container } = render(<Harness />);
    const a = getByTestId('slot-link') as HTMLAnchorElement;
    // No button rendered — slot replaced root.
    expect(container.querySelector('button')).toBeNull();
    // className merged: contains both base button styling and the custom class.
    expect(a.className).toContain('custom-class');
    expect(a.className).toContain('inline-flex');
    expect(a.className).toContain('border-retro-cyan/40');
    // onClick runs both handlers.
    fireEvent.click(a);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(wrapperClick).toHaveBeenCalledTimes(1);
    // External ref attached to the slot anchor.
    expect(externalRef.current).toBe(a);
  });

  it("hands the child's own ref the element without reading element.ref, which React 19 deprecates", () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const childRef = React.createRef<HTMLAnchorElement>();
    const { getByTestId } = render(
      <PixelButton asChild>
        <a ref={childRef} href="/foo" data-testid="slot-link">
          Go
        </a>
      </PixelButton>,
    );
    expect(childRef.current).toBe(getByTestId('slot-link'));
    expect(error.mock.calls.flat().join('\n')).not.toMatch(/element\.ref/);
    error.mockRestore();
  });

  it('falls back to <button> when asChild is true but child is not a valid element', () => {
    const { getByRole } = render(<PixelButton asChild>plain text</PixelButton>);
    // text node isn't a valid React element → renders a button.
    expect(getByRole('button')).toBeTruthy();
  });
});

describe('PixelButton — keyboard focus', () => {
  it('rings keyboard focus, keeping an outline for forced-colors mode, which drops the ring', () => {
    const classes = render(<PixelButton surface="linear">Go</PixelButton>).getByRole('button').className.split(' ');
    expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(classes.filter((c) => c.endsWith('outline-none'))).toEqual([]);
  });
});

describe('PixelButton — shadows and moves', () => {
  const DROP_SHADOWS = ['pxl-shadow', 'pxl-shadow-hover', 'pxl-shadow-active'];

  it('moves a pixel button on hover and press without a drop shadow, which its cut corners would clip', () => {
    const press = { solid: 'pxl-nudge-active', soft: 'pxl-nudge-active', outline: 'active:scale-[0.97]' } as const;
    for (const [variant, pressed] of Object.entries(press) as Array<[keyof typeof press, string]>) {
      const { getByRole, unmount } = render(<PixelButton variant={variant}>Go</PixelButton>);
      const classes = getByRole('button').className.split(' ');
      expect(classes).toEqual(expect.arrayContaining(['pxl-corner-sm', 'pxl-nudge-hover', pressed]));
      for (const shadow of DROP_SHADOWS) expect(classes).not.toContain(shadow);
      unmount();
    }
  });

  it('keeps the linear shadows', () => {
    const classes = render(<PixelButton surface="linear" variant="soft">Go</PixelButton>).getByRole('button').className.split(' ');
    expect(classes).toEqual(expect.arrayContaining(['shadow-sm', 'hover:shadow-md', 'active:shadow-sm']));
  });

  it('holds a disabled button still, with no shadow', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const { getByRole, unmount } = render(<PixelButton surface={surface} variant="soft" disabled>Go</PixelButton>);
      const classes = getByRole('button').className.split(' ');
      for (const name of [...DROP_SHADOWS, 'pxl-nudge-hover', 'pxl-nudge-active', 'shadow-sm', 'hover:shadow-md', 'active:shadow-sm']) {
        expect(classes).not.toContain(name);
      }
      unmount();
    }
  });
});

describe('PixelButton — loading', () => {
  it('holds a loading button still: no hover or press feedback, its resting look kept', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const { getByRole, unmount } = render(<PixelButton surface={surface} variant="soft" loading>Save</PixelButton>);
      const classes = getByRole('button').className.split(' ');
      for (const name of ['pxl-nudge-hover', 'pxl-nudge-active', 'hover:shadow-md', 'active:shadow-sm']) expect(classes).not.toContain(name);
      if (surface === 'linear') expect(classes).toContain('shadow-sm');
      unmount();
    }
    const outline = render(<PixelButton variant="outline" loading>Save</PixelButton>).getByRole('button').className.split(' ');
    expect(outline).not.toContain('active:scale-[0.97]');
  });

  it('turns its spinner only for a reader who allows motion, from the server markup on', () => {
    const { getByTestId } = render(<PixelButton loading>Save</PixelButton>);
    const spinner = getByTestId('pxl-button-spinner').className.split(' ');
    expect(spinner).toContain('motion-safe:animate-spin');
    expect(spinner).not.toContain('animate-spin');
  });
});
