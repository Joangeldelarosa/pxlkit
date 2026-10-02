/**
 * Rendering the React reference: server markup and client mounts.
 */
import { act, createElement, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { elapse } from './clock';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Server-rendered markup of a React example. */
export function reactServerHtml(Example: ComponentType): string {
  return renderToString(createElement(Example));
}

export interface Mounted {
  /** The element the example was mounted into. */
  container: HTMLElement;
  /** Let the framework settle (effects, re-renders) after a DOM interaction. */
  flush(): Promise<void>;
  unmount(): Promise<void>;
}

/**
 * Settle React: run pending updates and effects, then the timers due now and
 * one task's worth of promise chains (Floating UI positioning, focus return),
 * so their updates render too.
 */
function settle(): Promise<void> {
  return act(async () => {
    await elapse(0);
  });
}

/** Mount a React example into a fresh container appended to `document.body`. */
export async function mountReact(Example: ComponentType): Promise<Mounted> {
  const container = document.createElement('div');
  container.setAttribute('data-parity-root', '');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(Example));
  });
  await settle();
  return {
    container,
    flush: settle,
    unmount: async () => {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}
