'use client';

import { useCallback, useId, useRef, useSyncExternalStore, type KeyboardEvent } from 'react';
import { CodeBlock } from './CodeBlock';

/** The frameworks Pxlkit's UI kit ships for. */
export type Framework = 'react' | 'vue' | 'angular';

export const FRAMEWORKS: ReadonlyArray<{ id: Framework; label: string; language: string; kit: string }> = [
  { id: 'react', label: 'React', language: 'tsx', kit: '@pxlkit/ui-kit' },
  { id: 'vue', label: 'Vue', language: 'vue', kit: '@pxlkit/ui-kit-vue' },
  { id: 'angular', label: 'Angular', language: 'ts', kit: '@pxlkit/ui-kit-angular' },
];

const STORAGE_KEY = 'pxlkit:framework';
const CHANGE_EVENT = 'pxlkit:framework-change';

function readFramework(): Framework {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'vue' || stored === 'angular' ? stored : 'react';
  } catch {
    return 'react';
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * The framework the reader picked last, shared by every code view on the
 * site and remembered across visits. Server renders, and readers who never
 * picked one, get React.
 */
export function usePreferredFramework(): [Framework, (framework: Framework) => void] {
  const framework = useSyncExternalStore(subscribe, readFramework, () => 'react' as const);
  const choose = useCallback((next: Framework) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return [framework, choose];
}

export interface FrameworkCodeProps {
  /** The React source — every component has one. */
  react: string;
  /** The Vue source, once the Vue kit implements the component. */
  vue?: string;
  /** The Angular source, once the Angular kit implements the component. */
  angular?: string;
  /**
   * `block` draws the code with the site's code block (copy button,
   * highlighting); `docs` with the component reference's plain one.
   */
  variant?: 'block' | 'docs';
  /** Label of the tab list, for screen readers. */
  label?: string;
}

/**
 * The same code in React, Vue and Angular, as tabs (WAI-ARIA tabs with
 * automatic activation). A framework without the code shows its tab
 * disabled; the panel then falls back to React.
 */
export function FrameworkCode({ react, vue, angular, variant = 'block', label = 'Framework' }: FrameworkCodeProps) {
  const sources: Record<Framework, string | undefined> = { react, vue, angular };
  const [preferred, choose] = usePreferredFramework();
  const selected = sources[preferred] ? preferred : 'react';
  const baseId = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const available = FRAMEWORKS.filter(({ id }) => sources[id]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = available.findIndex(({ id }) => id === selected);
    const target =
      event.key === 'ArrowRight' ? (index + 1) % available.length
      : event.key === 'ArrowLeft' ? (index - 1 + available.length) % available.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? available.length - 1
      : -1;
    if (target < 0) return;
    event.preventDefault();
    const next = available[target]!.id;
    choose(next);
    tabs.current[FRAMEWORKS.findIndex(({ id }) => id === next)]?.focus();
  };

  const framework = FRAMEWORKS.find(({ id }) => id === selected)!;
  const code = sources[selected]!;

  return (
    <div className="framework-code">
      <div role="tablist" aria-label={label} className="flex gap-1 mb-1">
        {FRAMEWORKS.map(({ id, label: name }, index) => {
          const enabled = Boolean(sources[id]);
          const active = id === selected;
          return (
            <button
              key={id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-${id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel`}
              tabIndex={active ? 0 : -1}
              disabled={!enabled}
              title={enabled ? undefined : `Not in the ${name} kit yet`}
              onClick={() => choose(id)}
              onKeyDown={onKeyDown}
              className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide border rounded-sm transition-colors ${
                active
                  ? 'border-retro-green/50 bg-retro-green/10 text-retro-green'
                  : 'border-retro-border text-retro-muted hover:text-retro-text disabled:opacity-40 disabled:hover:text-retro-muted'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-${selected}`} tabIndex={0}>
        {variant === 'block' ? (
          <CodeBlock code={code} language={framework.language} />
        ) : (
          <pre className="docs-code">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
