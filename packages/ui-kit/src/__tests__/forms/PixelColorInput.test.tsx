import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelColorInput } from '../../forms/PixelColorInput';

describe('PixelColorInput', () => {
  function getSwatches(): HTMLButtonElement[] {
    // PixelPopover content portals into document.body — query the doc not the
    // render container so we still find the swatches after the popover opens.
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>('button[aria-label^="#"]'),
    );
  }

  it('no value shows default presets first', () => {
    const { getByRole } = render(<PixelColorInput label="Color" />);
    // Open the popover
    fireEvent.click(getByRole('button', { name: /color/i }));
    // Default palette renders a grid of swatch buttons.
    const swatches = getSwatches();
    expect(swatches.length).toBeGreaterThanOrEqual(16);
  });

  it('clicking preset calls onChange with hex', () => {
    const onChange = vi.fn();
    const presets = ['#ff0000', '#00ff00', '#0000ff'];
    const { getByRole } = render(
      <PixelColorInput presets={presets} onChange={onChange} />,
    );
    fireEvent.click(getByRole('button', { name: /color/i }));
    const swatches = getSwatches();
    fireEvent.click(swatches[1]);
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('manual input updates value', () => {
    const onChange = vi.fn();
    const { getByRole, getByLabelText } = render(
      <PixelColorInput onChange={onChange} />,
    );
    fireEvent.click(getByRole('button', { name: /color/i }));
    const hexInput = getByLabelText(/hex value/i) as HTMLInputElement;
    fireEvent.change(hexInput, { target: { value: '#abcdef' } });
    expect(onChange).toHaveBeenCalledWith('#abcdef');
  });

  it('partial hex input does not leak through onChange', () => {
    const onChange = vi.fn();
    const { getByRole, getByLabelText } = render(
      <PixelColorInput onChange={onChange} />,
    );
    fireEvent.click(getByRole('button', { name: /color/i }));
    const hexInput = getByLabelText(/hex value/i) as HTMLInputElement;
    // Partial hex — should NOT commit.
    fireEvent.change(hexInput, { target: { value: '#a' } });
    expect(onChange).not.toHaveBeenCalled();
    // Local draft reflects what the user typed.
    expect(hexInput.value).toBe('#a');
    // Complete hex now commits.
    fireEvent.change(hexInput, { target: { value: '#aabbcc' } });
    expect(onChange).toHaveBeenCalledWith('#aabbcc');
  });

  it('format=rgb returns rgb(...) string', () => {
    const onChange = vi.fn();
    const presets = ['#ff0000'];
    const { getByRole } = render(
      <PixelColorInput presets={presets} format="rgb" onChange={onChange} />,
    );
    fireEvent.click(getByRole('button', { name: /color/i }));
    const swatches = getSwatches();
    fireEvent.click(swatches[0]);
    expect(onChange).toHaveBeenCalledWith('rgb(255, 0, 0)');
  });

  it('hidden input serializes value', () => {
    const { container } = render(
      <PixelColorInput name="brand" defaultValue="#112233" />,
    );
    const hidden = container.querySelector(
      'input[type="hidden"][name="brand"]',
    ) as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toBe('#112233');
  });
});
