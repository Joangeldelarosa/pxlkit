import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelAccordion } from '../../navigation/PixelAccordion';

const ITEMS = [
  { id: 'one', title: 'First', content: 'First body' },
  { id: 'two', title: 'Second', content: 'Second body' },
  { id: 'three', title: 'Third', content: 'Third body' },
];

describe('PixelAccordion', () => {
  it('expands the first item by default', () => {
    const { getByRole, getByText, queryByText } = render(<PixelAccordion items={ITEMS} />);
    expect(getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe('true');
    expect(getByText('First body')).toBeTruthy();
    expect(queryByText('Second body')).toBeNull();
  });

  it('collapsedByDefault starts with every panel closed', () => {
    const { getAllByRole, queryByText } = render(
      <PixelAccordion items={ITEMS} collapsedByDefault />,
    );
    getAllByRole('button').forEach((h) => {
      expect(h.getAttribute('aria-expanded')).toBe('false');
    });
    expect(queryByText('First body')).toBeNull();
  });

  it('clicking a header expands its panel; clicking again collapses it', () => {
    const { getByRole, queryByText } = render(
      <PixelAccordion items={ITEMS} collapsedByDefault />,
    );
    const second = getByRole('button', { name: 'Second' });
    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(queryByText('Second body')).toBeTruthy();
    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('false');
    expect(queryByText('Second body')).toBeNull();
  });

  it('single mode (default): expanding one item collapses the previously open one', () => {
    const { getByRole, queryByText } = render(<PixelAccordion items={ITEMS} />);
    const first = getByRole('button', { name: 'First' });
    const third = getByRole('button', { name: 'Third' });
    fireEvent.click(third);
    expect(third.getAttribute('aria-expanded')).toBe('true');
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(queryByText('Third body')).toBeTruthy();
    expect(queryByText('First body')).toBeNull();
  });

  it('allowMultiple keeps several panels open simultaneously', () => {
    const { getByRole, queryByText } = render(
      <PixelAccordion items={ITEMS} allowMultiple />,
    );
    fireEvent.click(getByRole('button', { name: 'Second' }));
    fireEvent.click(getByRole('button', { name: 'Third' }));
    // First was open by default and stays open.
    expect(queryByText('First body')).toBeTruthy();
    expect(queryByText('Second body')).toBeTruthy();
    expect(queryByText('Third body')).toBeTruthy();
  });

  it('wires aria-controls on the header to the panel id, and aria-labelledby back', () => {
    const { getByRole, getByText } = render(<PixelAccordion items={ITEMS} />);
    const header = getByRole('button', { name: 'First' });
    const panelId = header.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!)!;
    expect(panel).toBeTruthy();
    expect(panel.textContent).toContain('First body');
    expect(panel.getAttribute('aria-labelledby')).toBe(header.id);
    // No role="region" on the panel (intentional — avoids landmark proliferation).
    expect(panel.getAttribute('role')).toBeNull();
    expect(getByText('First body')).toBeTruthy();
  });

  it('forwards ref to the root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<PixelAccordion ref={ref} items={ITEMS} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
