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
