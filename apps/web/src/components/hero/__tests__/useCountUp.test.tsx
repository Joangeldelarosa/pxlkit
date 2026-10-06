import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useCountUp } from '../useCountUp';

function Probe({
  to,
  duration,
  start,
  animate,
}: {
  to: number;
  duration: number;
  start: boolean;
  animate?: boolean;
}) {
  const v = useCountUp({ to, duration, start, animate });
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

  it('renders the target on the server, so the figure is in the HTML', () => {
    const html = renderToString(<Probe to={111} duration={500} start={false} />);
    expect(html).toContain('>111<');
  });

  it('stays at the target when animate is false', async () => {
    const { getByTestId } = render(<Probe to={111} duration={500} start={false} animate={false} />);
    expect(getByTestId('v').textContent).toBe('111');
    await act(async () => {
      vi.advanceTimersByTime(700);
    });
    expect(getByTestId('v').textContent).toBe('111');
  });
});
