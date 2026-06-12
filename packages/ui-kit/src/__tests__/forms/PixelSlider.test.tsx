import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelSlider } from '../../forms/PixelSlider';

describe('PixelSlider — single mode (regression)', () => {
  it('renders one thumb with role=slider and emits number on ArrowRight', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [v, setV] = useState(50);
      return (
        <PixelSlider
          label="Volume"
          value={v}
          onChange={(n: number) => { onChange(n); setV(n); }}
        />
      );
    }
    const { container } = render(<Wrap />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs.length).toBe(1);
    fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(51);
    expect(typeof onChange.mock.calls[0][0]).toBe('number');
  });
});

describe('PixelSlider — range mode', () => {
  it('renders two thumbs in a role=group container when value is a tuple', () => {
    const { container, getByRole } = render(
      <PixelSlider
        label="Price"
        value={[20, 80]}
        onChange={() => {}}
      />,
    );
    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs.length).toBe(2);
    // Container exposes group semantics with the label
    const group = getByRole('group', { name: 'Price' });
    expect(group).toBeTruthy();
    // Each thumb has an individual aria-label distinguishing min/max
    const labels = Array.from(thumbs).map((t) => t.getAttribute('aria-label'));
    expect(labels).toContain('Price minimum');
    expect(labels).toContain('Price maximum');
  });

  it('ArrowRight on the lower thumb moves only the lower value', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [v, setV] = useState<[number, number]>([20, 80]);
      return (
        <PixelSlider
          label="Range"
          value={v}
          onChange={(next: [number, number]) => { onChange(next); setV(next); }}
        />
      );
    }
    const { container } = render(<Wrap />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith([21, 80]);
  });

  it('clamps lower against upper so they never cross', () => {
    const onChange = vi.fn();
    function Wrap() {
      const [v, setV] = useState<[number, number]>([78, 80]);
      return (
        <PixelSlider
          label="Range"
          value={v}
          onChange={(next: [number, number]) => { onChange(next); setV(next); }}
        />
      );
    }
    const { container } = render(<Wrap />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    // Push lower past upper: End on the lower thumb → should clamp at upper (80)
    fireEvent.keyDown(thumbs[0], { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith([80, 80]);
  });

  it('serializes range with [0]/[1] hidden inputs when name is set', () => {
    const { container } = render(
      <PixelSlider label="Range" name="bounds" value={[10, 30]} onChange={() => {}} />,
    );
    const hidden = container.querySelectorAll('input[type="hidden"]');
    expect(hidden.length).toBe(2);
    const names = Array.from(hidden).map((i) => i.getAttribute('name'));
    expect(names).toContain('bounds[0]');
    expect(names).toContain('bounds[1]');
  });
});

describe('PixelSlider — marks', () => {
  it('renders one element per mark with its label and left:% style', () => {
    const { getByTestId, getByText } = render(
      <PixelSlider
        label="Score"
        value={50}
        onChange={() => {}}
        marks={[
          { value: 0, label: 'low' },
          { value: 50, label: 'mid' },
          { value: 100, label: 'high' },
        ]}
      />,
    );
    const wrap = getByTestId('pxl-slider-marks');
    expect(wrap.children.length).toBe(3);
    expect(getByText('low')).toBeTruthy();
    expect(getByText('mid')).toBeTruthy();
    expect(getByText('high')).toBeTruthy();
    // The midpoint mark is placed at 50%
    const mid = getByText('mid') as HTMLElement;
    expect(mid.style.left).toBe('50%');
  });
});

describe('PixelSlider — showTooltip', () => {
  it("'never' (default) shows no tooltip when idle", () => {
    const { container } = render(
      <PixelSlider label="V" value={50} onChange={() => {}} />,
    );
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });

  it("'always' shows the tooltip with the current value", () => {
    const { container } = render(
      <PixelSlider label="V" value={42} onChange={() => {}} showTooltip="always" />,
    );
    const tip = container.querySelector('[role="tooltip"]');
    expect(tip).toBeTruthy();
    expect(tip!.textContent).toBe('42');
  });

  it("'drag' shows the tooltip while the thumb has focus", () => {
    const { container } = render(
      <PixelSlider label="V" value={50} onChange={() => {}} showTooltip="drag" />,
    );
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    const thumb = container.querySelector('[role="slider"]') as HTMLElement;
    fireEvent.focus(thumb);
    expect(container.querySelector('[role="tooltip"]')).toBeTruthy();
    fireEvent.blur(thumb);
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });
});

describe('PixelSlider — ticks', () => {
  it('renders one tick per discrete step (capped) under the track', () => {
    const { getAllByTestId } = render(
      <PixelSlider
        label="V"
        min={0}
        max={10}
        step={1}
        value={5}
        onChange={() => {}}
        ticks
      />,
    );
    // (10 - 0) / 1 = 10 → 11 ticks (0..10 inclusive).
    expect(getAllByTestId('pxl-slider-tick').length).toBe(11);
  });

  it('omits ticks when ticks=false (default)', () => {
    const { queryAllByTestId } = render(
      <PixelSlider label="V" value={5} onChange={() => {}} />,
    );
    expect(queryAllByTestId('pxl-slider-tick').length).toBe(0);
  });
});
