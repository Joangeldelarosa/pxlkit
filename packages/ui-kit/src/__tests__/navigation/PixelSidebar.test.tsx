import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelSidebar } from '../../navigation/PixelSidebar';

function makeSections(onA = vi.fn(), onB = vi.fn(), onC = vi.fn()) {
  return [
    {
      title: 'Main',
      items: [
        { id: 'home', label: 'Home', onSelect: onA, active: true },
        { id: 'projects', label: 'Projects', onSelect: onB, badge: { label: '3', tone: 'cyan' as const } },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          onSelect: onC,
          nested: [
            { id: 'profile', label: 'Profile' },
            { id: 'security', label: 'Security' },
          ],
        },
      ],
    },
  ];
}

describe('PixelSidebar', () => {
  it('renders sections with items', () => {
    const { getByText, getAllByRole } = render(
      <PixelSidebar sections={makeSections()} />,
    );
    expect(getByText('Main')).toBeTruthy();
    expect(getByText('Account')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Projects')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    // Top-level items + nested items rendered as buttons.
    const buttons = getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('collapsed=true hides labels via sr-only', () => {
    const { getByText } = render(
      <PixelSidebar collapsed sections={makeSections()} />,
    );
    const label = getByText('Home');
    expect(label.className).toMatch(/sr-only/);
  });

  it('item onSelect fires on click', () => {
    const onA = vi.fn();
    const { getByText } = render(
      <PixelSidebar sections={makeSections(onA)} />,
    );
    fireEvent.click(getByText('Home').closest('button')!);
    expect(onA).toHaveBeenCalledTimes(1);
  });

  it('badge renders when provided', () => {
    const { getByText } = render(
      <PixelSidebar sections={makeSections()} />,
    );
    expect(getByText('3')).toBeTruthy();
  });

  it('nested items render as sub-tree', () => {
    const { getByText } = render(
      <PixelSidebar sections={makeSections()} />,
    );
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Security')).toBeTruthy();
  });
});
