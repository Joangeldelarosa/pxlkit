import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { MouseProvider, useMouse } from '../mouseContext';

function Probe() {
  const { mouseRef, active } = useMouse();
  const [snap, setSnap] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setSnap({ x: mouseRef.current.x, y: mouseRef.current.y });
    }, 5);
    return () => clearInterval(id);
  }, [mouseRef]);
  return (
    <span data-testid="mouse">
      {snap.x.toFixed(2)},{snap.y.toFixed(2)},{String(active)}
    </span>
  );
}

describe('useMouse', () => {
  it('starts inactive at 0,0', () => {
    const { getByTestId } = render(
      <MouseProvider>
        <Probe />
      </MouseProvider>
    );
    expect(getByTestId('mouse').textContent).toMatch(/^0\.00,0\.00,false$/);
  });

  it('throws when used outside MouseProvider', () => {
    const Naked = () => {
      useMouse();
      return null;
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Naked />)).toThrow(/MouseProvider/);
    spy.mockRestore();
  });

  it('provides mouseRef + containerRef + active boolean', () => {
    let captured: ReturnType<typeof useMouse> | null = null;
    const Capture = () => {
      captured = useMouse();
      return null;
    };
    render(
      <MouseProvider>
        <Capture />
      </MouseProvider>
    );
    expect(captured).not.toBeNull();
    expect(captured!.mouseRef.current).toEqual({ x: 0, y: 0 });
    expect(captured!.active).toBe(false);
    expect(captured!.containerRef).toBeDefined();
  });
});
