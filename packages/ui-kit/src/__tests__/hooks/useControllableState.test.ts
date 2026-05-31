import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useControllableState } from '../../hooks/useControllableState';

describe('useControllableState', () => {
  it('uncontrolled mode tracks internal state', () => {
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultValue: 0 }),
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
  });

  it('controlled mode reflects value prop', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useControllableState<number>({ value }),
      { initialProps: { value: 10 } },
    );

    expect(result.current[0]).toBe(10);

    rerender({ value: 42 });

    expect(result.current[0]).toBe(42);
  });

  it('controlled mode setter calls onChange but does not update returned value until prop changes', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) =>
        useControllableState<number>({ value, onChange }),
      { initialProps: { value: 1 } },
    );

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](7);
    });

    expect(onChange).toHaveBeenCalledWith(7);
    // Value did not change because parent didn't pass a new prop yet.
    expect(result.current[0]).toBe(1);

    rerender({ value: 7 });
    expect(result.current[0]).toBe(7);
  });

  it('uncontrolled setter accepts updater function', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultValue: 3, onChange }),
    );

    expect(result.current[0]).toBe(3);

    act(() => {
      result.current[1]((prev) => prev + 4);
    });

    expect(result.current[0]).toBe(7);
    expect(onChange).toHaveBeenCalledWith(7);
  });
});
