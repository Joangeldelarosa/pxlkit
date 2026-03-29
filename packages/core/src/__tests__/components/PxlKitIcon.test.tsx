import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PxlKitIcon } from '../../components/PxlKitIcon';
import { testIcon } from '../fixtures';

describe('PxlKitIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('has correct viewBox based on icon size', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe(
      `0 0 ${testIcon.size} ${testIcon.size}`
    );
  });

  it('has role="img"', () => {
    render(<PxlKitIcon icon={testIcon} />);
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('uses icon name as default aria-label', () => {
    render(<PxlKitIcon icon={testIcon} />);
    expect(screen.getByLabelText(testIcon.name)).toBeTruthy();
  });

  it('custom aria-label overrides default', () => {
    render(<PxlKitIcon icon={testIcon} aria-label="Custom Label" />);
    expect(screen.getByLabelText('Custom Label')).toBeTruthy();
  });

  it('applies className prop to SVG', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} className="my-class" />
    );
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('my-class')).toBe(true);
  });

  it('applies style prop to SVG', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} style={{ border: '1px solid red' }} />
    );
    const svg = container.querySelector('svg');
    expect(svg?.style.border).toBe('1px solid red');
  });

  it('sets width and height from size prop', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} size={64} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('64');
    expect(svg?.getAttribute('height')).toBe('64');
  });

  it('uses default size of 32', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32');
  });

  it('monochrome mode uses currentColor (default)', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const rects = container.querySelectorAll('rect');
    rects.forEach((rect) => {
      expect(rect.getAttribute('fill')).toBe('currentColor');
    });
  });

  it('colorful mode uses actual pixel colors', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} colorful />
    );
    const rects = container.querySelectorAll('rect');
    const fills = Array.from(rects).map((r) => r.getAttribute('fill'));
    // Should contain actual colors, not currentColor
    expect(fills.some((f) => f !== 'currentColor')).toBe(true);
    expect(fills).toContain('#FF0000');
  });

  it('custom color prop is used in monochrome mode', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} color="#FF5500" />
    );
    const rects = container.querySelectorAll('rect');
    rects.forEach((rect) => {
      expect(rect.getAttribute('fill')).toBe('#FF5500');
    });
  });

  it('has shape-rendering="crispEdges"', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('shape-rendering')).toBe('crispEdges');
  });
});
