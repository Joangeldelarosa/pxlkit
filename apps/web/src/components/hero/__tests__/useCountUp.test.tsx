import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

function Probe({ to, duration, start }: { to: number; duration: number; start: boolean }) {
  const v = useCountUp({ to, duration, start });
  return <span data-testid="v">{v}</span>;
}

describe('useCountUp', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns 0 when start is false', () => {
    const { getByTestId } = render(<Probe to={100} duration={500} start={false} />);
    expect(getByTestId('v').textContent).toBe('0');
  });

  it('reaches target after duration when start is true', async () => {
    const { getByTestId } = render(<Probe to={226} duration={500} start={true} />);
    await act(async () => {
      vi.advanceTimersByTime(700);
    });
    expect(Number(getByTestId('v').textContent)).toBe(226);
  });

  it('returns an integer value (rounded)', async () => {
    const { getByTestId } = render(<Probe to={54} duration={500} start={true} />);
    await act(async () => {
      vi.advanceTimersByTime(700);
    });
    const txt = getByTestId('v').textContent ?? '';
    expect(Number.isInteger(Number(txt))).toBe(true);
  });
});
