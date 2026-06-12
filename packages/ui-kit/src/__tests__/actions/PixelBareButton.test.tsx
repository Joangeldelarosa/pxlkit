import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelBareButton } from '../../actions/PixelBareButton';

describe('PixelBareButton — unstyled escape hatch', () => {
  it('renders a plain <button> with no injected classes', () => {
    const { getByRole } = render(<PixelBareButton>Go</PixelBareButton>);
    const btn = getByRole('button');
    expect(btn.textContent).toBe('Go');
    expect(btn.className).toBe('');
  });

  it('defaults type to "button" (no accidental form submits)', () => {
    const { getByRole } = render(<PixelBareButton>Go</PixelBareButton>);
    expect((getByRole('button') as HTMLButtonElement).type).toBe('button');
  });

  it('allows overriding type to "submit"', () => {
    const { getByRole } = render(<PixelBareButton type="submit">Send</PixelBareButton>);
    expect((getByRole('button') as HTMLButtonElement).type).toBe('submit');
  });

  it('fires onClick and passes through DOM props', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <PixelBareButton onClick={onClick} aria-label="Do it" data-testid="bare">
        Go
      </PixelBareButton>,
    );
    const btn = getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('Do it');
    expect(btn.getAttribute('data-testid')).toBe('bare');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports disabled (blocks clicks)', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <PixelBareButton disabled onClick={onClick}>Go</PixelBareButton>,
    );
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards ref to the native button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<PixelBareButton ref={ref}>Go</PixelBareButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
