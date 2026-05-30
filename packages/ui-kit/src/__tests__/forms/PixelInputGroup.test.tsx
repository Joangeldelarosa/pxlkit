import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PixelInputGroup } from '../../forms/PixelInputGroup';

describe('PixelInputGroup', () => {
  it('renders children inside grouped container', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getByTestId, container } = render(
      <PixelInputGroup data-testid="group" aria-label="Search">
        <input data-testid="child-input" placeholder="search" />
        <button data-testid="child-btn">Go</button>
      </PixelInputGroup>,
    );
    const group = getByTestId('group');
    expect(group).toBeTruthy();
    // children present inside
    expect(group.querySelector('[data-testid="child-input"]')).toBeTruthy();
    expect(group.querySelector('[data-testid="child-btn"]')).toBeTruthy();
    // outer container exists and is a div
    expect(group.tagName).toBe('DIV');
    // group role for screen readers — only when there's an accessible name
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Search');
    // outer container has border class (joined shell)
    expect(group.className).toMatch(/border/);
    // verify children render in document
    expect(container.querySelectorAll('[data-testid^="child-"]').length).toBe(2);
    warn.mockRestore();
  });

  it('unlabeled group drops role=group + warns in dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getByTestId } = render(
      <PixelInputGroup data-testid="group">
        <input />
        <button>Go</button>
      </PixelInputGroup>,
    );
    const group = getByTestId('group');
    expect(group.getAttribute('role')).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[PixelInputGroup]'),
    );
    warn.mockRestore();
  });

  it('forwards className', () => {
    const { getByTestId } = render(
      <PixelInputGroup data-testid="group" className="custom-class extra-test">
        <input />
      </PixelInputGroup>,
    );
    const group = getByTestId('group');
    expect(group.className).toContain('custom-class');
    expect(group.className).toContain('extra-test');
  });

  it('size=lg applies large size', () => {
    const { getByTestId } = render(
      <PixelInputGroup data-testid="group" size="lg">
        <input />
      </PixelInputGroup>,
    );
    const group = getByTestId('group');
    // lg height token (h-12) from sizeHeight scale
    expect(group.className).toMatch(/h-12/);
  });
});
