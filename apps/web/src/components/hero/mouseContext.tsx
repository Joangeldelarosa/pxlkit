'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

type MouseRef = { current: { x: number; y: number } };

type Ctx = {
  mouseRef: MouseRef;
  active: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
};

const MouseContext = createContext<Ctx | null>(null);

/**
 * Provides RAF-safe mouse coordinates as a ref (no re-render per move).
 * Coords are normalised to -1..+1 relative to the rendered MouseProvider root.
 * The `active` boolean re-renders only on enter/leave transitions.
 */
export function MouseProvider({ children }: { children: ReactNode }) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      mouseRef.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      setActive((cur) => (cur ? cur : true));
    };
    const onLeave = () => {
      setActive(false);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <MouseContext.Provider value={{ mouseRef, active, containerRef }}>
      <div ref={containerRef} className="contents">
        {children}
      </div>
    </MouseContext.Provider>
  );
}

export function useMouse(): Ctx {
  const ctx = useContext(MouseContext);
  if (!ctx) throw new Error('useMouse must be used inside <MouseProvider>');
  return ctx;
}
