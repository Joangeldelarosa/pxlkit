import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PxlKitButton } from '../../actions/PxlKitButton';
import { PixelIconButton } from '../../actions/PixelIconButton';

/* PxlKitButton is the deprecated alias of PixelIconButton (ADR-0004,
   removal target 3.0.0). These tests pin the alias contract. */

describe('PxlKitButton — deprecated alias of PixelIconButton', () => {
  it('is the exact same component as PixelIconButton', () => {
    expect(PxlKitButton).toBe(PixelIconButton);
  });

  it('renders an icon button with aria-label + title from the required label', () => {
    const { getByRole } = render(
      <PxlKitButton label="Settings" icon={<svg data-testid="gear" />} />,
    );
    const btn = getByRole('button', { name: 'Settings' });
    expect(btn.getAttribute('aria-label')).toBe('Settings');
    expect(btn.getAttribute('title')).toBe('Settings');
  });

  it('fires onClick and supports disabled', () => {
    const onClick = vi.fn();
    const { getByRole, rerender } = render(
      <PxlKitButton label="Go" icon={<span>x</span>} onClick={onClick} />,
    );
    const btn = getByRole('button') as HTMLButtonElement;
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<PxlKitButton label="Go" icon={<span>x</span>} onClick={onClick} disabled />);
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('PixelIconButton — shadows and moves', () => {
  it('moves a pixel button on hover and press without a drop shadow, which its cut corners would clip', () => {
    const classes = render(<PixelIconButton label="Go" icon={<span>x</span>} />).getByRole('button').className.split(' ');
    expect(classes).toEqual(expect.arrayContaining(['pxl-corner-sm', 'pxl-nudge-hover', 'pxl-nudge-active']));
    for (const shadow of ['pxl-shadow', 'pxl-shadow-hover', 'pxl-shadow-active']) expect(classes).not.toContain(shadow);
  });

  it('keeps the linear shadows, and holds a disabled button still', () => {
    const { getAllByRole } = render(
      <>
        <PixelIconButton label="Go" icon={<span>x</span>} surface="linear" />
        <PixelIconButton label="Off" icon={<span>x</span>} disabled />
      </>,
    );
    const [linear, disabled] = getAllByRole('button').map((button) => button.className.split(' '));
    expect(linear).toEqual(expect.arrayContaining(['shadow-sm', 'hover:shadow-md', 'active:shadow-sm']));
    for (const name of ['pxl-shadow', 'pxl-nudge-hover', 'pxl-nudge-active']) expect(disabled).not.toContain(name);
  });
});
