import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelBreadcrumb } from '../../navigation/PixelBreadcrumb';

describe('PixelBreadcrumb', () => {
  it('renders a nav landmark with the default aria-label and an ordered list', () => {
    const { getByRole } = render(
      <PixelBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Docs', active: true }]} />,
    );
    const nav = getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeTruthy();
    expect(nav.querySelector('ol')).toBeTruthy();
    expect(nav.querySelectorAll('li').length).toBe(2);
  });

  it('honors a custom ariaLabel', () => {
    const { getByRole } = render(
      <PixelBreadcrumb ariaLabel="Miga de pan" items={[{ label: 'Inicio' }]} />,
    );
    expect(getByRole('navigation', { name: 'Miga de pan' })).toBeTruthy();
  });

  it('active crumb renders as plain text with aria-current=page', () => {
    const { getByText } = render(
      <PixelBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Current', active: true }]} />,
    );
    const current = getByText('Current');
    expect(current.tagName).toBe('SPAN');
    expect(current.getAttribute('aria-current')).toBe('page');
  });

  it('href-only crumb renders an anchor with that href', () => {
    const { getByText } = render(
      <PixelBreadcrumb items={[{ label: 'Icons', href: '/icons' }]} />,
    );
    const link = getByText('Icons') as HTMLAnchorElement;
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/icons');
  });

  it('onClick crumb renders a button and fires the handler (takes precedence over href)', () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <PixelBreadcrumb items={[{ label: 'Back', href: '/back', onClick }]} />,
    );
    const btn = getByText('Back');
    expect(btn.tagName).toBe('BUTTON');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('plain crumb (no href, no onClick, not active) renders an inert span', () => {
    const { getByText } = render(<PixelBreadcrumb items={[{ label: 'Plain' }]} />);
    const el = getByText('Plain');
    expect(el.tagName).toBe('SPAN');
    expect(el.getAttribute('aria-current')).toBeNull();
  });

  it('renders aria-hidden separators between crumbs but not before the first', () => {
    const { getByRole } = render(
      <PixelBreadcrumb
        items={[{ label: 'A', href: '/a' }, { label: 'B', href: '/b' }, { label: 'C', active: true }]}
      />,
    );
    const nav = getByRole('navigation');
    // 3 crumbs → 2 separators (default pixel surface renders SVG chevrons).
    const separators = nav.querySelectorAll('[aria-hidden]');
    expect(separators.length).toBe(2);
  });

  it('forwards ref to the nav element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<PixelBreadcrumb ref={ref} items={[{ label: 'Home' }]} />);
    expect(ref.current?.tagName).toBe('NAV');
  });
});
