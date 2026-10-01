import { afterEach } from 'vitest';

// jsdom does not implement scrolling; the scroll lock restores the offset.
if (typeof window !== 'undefined') window.scrollTo = () => {};

afterEach(() => {
  // Node-environment suites (server rendering) have no document to reset.
  if (typeof document !== 'undefined') document.body.innerHTML = '';
});
