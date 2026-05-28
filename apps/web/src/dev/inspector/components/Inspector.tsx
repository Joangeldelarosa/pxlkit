'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAnimatedIcon } from '@pxlkit/core';
import { findIcon, getPackById } from '../lib/registry';
import { serializeInspectorParams } from '../lib/params';
import { modeOf, type InspectorState } from '../lib/types';
import { InspectorControls } from './InspectorControls';
import { MultiResRow } from './MultiResRow';
import { ContactSheet } from './ContactSheet';
import { IconStrip } from './IconStrip';
import { IconSlider } from './IconSlider';

export interface InspectorProps {
  initialState: InspectorState;
}

export function Inspector({ initialState }: InspectorProps) {
  const router = useRouter();
  const [state, setState] = useState<InspectorState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flag client mount so Playwright can wait on [data-ready="true"]
    setReady(true);
  }, []);

  const apply = (next: InspectorState) => {
    setState(next);
    router.replace(`/dev/inspector?${serializeInspectorParams(next)}`, { scroll: false });
  };

  const pack = getPackById(state.pack) ?? null;
  const packIcons = pack?.icons.map((i) => i.name) ?? [];
  const mode = modeOf(state);
  const selected = state.icon ? findIcon(state.pack, state.icon) ?? null : null;
  const animatedFrameCount = selected && isAnimatedIcon(selected) ? selected.frames.length : 0;

  return (
    <main
      data-inspector-root
      data-ready={ready ? 'true' : 'false'}
      style={{
        minHeight: '100vh',
        background: '#0a0a0d',
        color: '#e6e6ea',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ padding: '14px 16px', borderBottom: '1px solid #1f1f27', display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontFamily: 'monospace', color: '#00E5A0' }}>pxlkit · icon inspector</h1>
        <span style={{ fontSize: 12, color: '#667' }}>
          {mode === 'single'
            ? `${state.pack}/${state.icon ?? '?'}${selected ? ` · native ${selected.size}×${selected.size}` : ''}`
            : `${state.pack} · ${state.view} · ${packIcons.length} icons`}
        </span>
      </header>

      <InspectorControls
        state={state}
        packIcons={packIcons}
        animatedFrameCount={animatedFrameCount}
        onChange={apply}
      />

      <section data-testid="inspector-stage" style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        {mode === 'single' ? (
          selected ? (
            <MultiResRow
              icon={selected}
              sizes={state.sizes}
              grid={state.grid}
              gridColor={state.gridColor}
              bg={state.bg}
              appearance={state.appearance}
              color={state.color}
              playing={state.playing}
              frame={state.frame}
            />
          ) : (
            <p data-testid="icon-missing" style={{ fontFamily: 'monospace', color: '#e57373' }}>
              icon &quot;{state.icon}&quot; not found in pack &quot;{state.pack}&quot;
            </p>
          )
        ) : pack ? (
          (() => {
            const shared = {
              pack,
              cell: state.cell,
              grid: state.grid,
              gridColor: state.gridColor,
              bg: state.bg,
              appearance: state.appearance,
              color: state.color,
            };
            if (state.view === 'strip') return <IconStrip {...shared} />;
            if (state.view === 'slider') return <IconSlider {...shared} />;
            return <ContactSheet {...shared} />;
          })()
        ) : null}
      </section>
    </main>
  );
}
