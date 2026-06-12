import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelPasswordInput } from '../../forms/PixelPasswordInput';

describe('PixelPasswordInput', () => {
  it('renders type=password by default with the Show toggle', () => {
    const { container, getByRole } = render(<PixelPasswordInput defaultValue="" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
    const toggle = getByRole('button', { name: 'Show' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggle flips visibility: type becomes text, label becomes Hide', () => {
    const { container, getByRole } = render(<PixelPasswordInput defaultValue="s3cret" />);
    const input = container.querySelector('input') as HTMLInputElement;
    const toggle = getByRole('button', { name: 'Show' });
    fireEvent.click(toggle);
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Hide');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(toggle);
    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show');
  });

  it('honors custom toggleLabels', () => {
    const { getByRole } = render(
      <PixelPasswordInput defaultValue="" toggleLabels={['Ver', 'Ocultar']} />,
    );
    const toggle = getByRole('button', { name: 'Ver' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar');
  });

  it('fires onChange as the user types (uncontrolled)', () => {
    const onChange = vi.fn();
    const { container } = render(<PixelPasswordInput defaultValue="" onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hunter2' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('hunter2');
  });

  it('disabled disables both the input and the visibility toggle', () => {
    const { container, getByRole } = render(<PixelPasswordInput disabled defaultValue="" />);
    expect((container.querySelector('input') as HTMLInputElement).disabled).toBe(true);
    expect((getByRole('button', { name: 'Show' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders label and hint via FieldShell', () => {
    const { getByText } = render(
      <PixelPasswordInput label="Password" hint="Min 8 chars" defaultValue="" />,
    );
    expect(getByText('Password')).toBeTruthy();
    expect(getByText('Min 8 chars')).toBeTruthy();
  });

  it('error sets aria-invalid and the red border class', () => {
    const { container, getByText } = render(
      <PixelPasswordInput error="Too short" defaultValue="" />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.className).toContain('border-retro-red/60');
    expect(getByText('Too short')).toBeTruthy();
  });

  it('toggle is excluded from the Tab order (tabIndex=-1)', () => {
    const { getByRole } = render(<PixelPasswordInput defaultValue="" />);
    expect((getByRole('button', { name: 'Show' }) as HTMLButtonElement).tabIndex).toBe(-1);
  });

  it('forwards ref to the native input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PixelPasswordInput ref={ref} defaultValue="" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current!.type).toBe('password');
  });
});
