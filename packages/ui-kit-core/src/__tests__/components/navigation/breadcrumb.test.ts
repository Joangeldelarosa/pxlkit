import { describe, expect, it } from 'vitest';
import {
  breadcrumbChevron,
  breadcrumbClasses,
  breadcrumbCrumbKind,
  breadcrumbCurrentClasses,
  breadcrumbLinkClasses,
} from '../../../components/navigation/breadcrumb';

const classesOf = (value: string) => value.split(' ');

describe('breadcrumb recipes', () => {
  it('renders the active crumb as the current page, whatever else it has', () => {
    expect(breadcrumbCrumbKind({ active: true, href: '/', onClick: () => {} })).toBe('current');
  });

  it('prefers a button over a link when a crumb has both onClick and href', () => {
    expect(breadcrumbCrumbKind({ href: '/back', onClick: () => {} })).toBe('button');
    expect(breadcrumbCrumbKind({ href: '/docs' })).toBe('link');
    expect(breadcrumbCrumbKind({})).toBe('text');
    expect(breadcrumbCrumbKind({ active: false, href: '' })).toBe('text');
  });

  it('sets the trail in the surface font', () => {
    expect(classesOf(breadcrumbClasses('pixel'))).toContain('font-mono');
    expect(classesOf(breadcrumbClasses('linear'))).toContain('font-sans');
  });

  it('underlines interactive crumbs on keyboard focus and emphasises the current one', () => {
    expect(classesOf(breadcrumbLinkClasses)).toEqual(
      expect.arrayContaining(['focus:outline-none', 'focus-visible:underline', 'focus-visible:decoration-2']),
    );
    expect(classesOf(breadcrumbCurrentClasses)).toContain('font-medium');
  });

  it('draws the chevron on an 8×8 grid', () => {
    expect(breadcrumbChevron.viewBox).toBe('0 0 8 8');
    expect(breadcrumbChevron.rects).toHaveLength(5);
    for (const [x, y, width, height] of breadcrumbChevron.rects) {
      expect(x + width).toBeLessThanOrEqual(8);
      expect(y + height).toBeLessThanOrEqual(8);
    }
  });
});
