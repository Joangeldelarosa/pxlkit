/**
 * Mounting Vue examples the same way the parity harness mounts React ones.
 */
import { createApp, createSSRApp, nextTick, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { elapse } from '../../../../scripts/parity/clock';
import type { Mounted } from '../../../../scripts/parity/react';

async function settle(): Promise<void> {
  await nextTick();
  await elapse(0);
  await nextTick();
}

/** Mount a Vue example into a fresh container appended to `document.body`. */
export async function mountVue(Example: Component): Promise<Mounted> {
  const container = document.createElement('div');
  container.setAttribute('data-parity-root', '');
  document.body.appendChild(container);
  const app = createApp(Example);
  app.mount(container);
  await settle();
  return {
    container,
    flush: settle,
    unmount: async () => {
      app.unmount();
      container.remove();
    },
  };
}

/** Server-rendered markup of a Vue example. */
export function vueServerHtml(Example: Component): Promise<string> {
  return renderToString(createSSRApp(Example));
}
