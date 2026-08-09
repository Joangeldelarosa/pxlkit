import pluginManifest from '../../../../../../plugins/pxlkit/.claude-plugin/plugin.json';
import { UI_KIT_VERSION } from '@/lib/pxlkit-version';

export const dynamic = 'force-static';

/**
 * The authoritative version endpoint the installed plugin polls.
 *
 * `check-updates.mjs` asks this first and falls back to the npm registry if it does
 * not answer. The site is authoritative because it is the only source that knows the
 * *plugin* version, which can move independently of the kit; npm only knows the kit.
 *
 * Both numbers are read from their source of truth. Hardcoding either would make the
 * update notice lie, which is worse than not having one.
 */
export function GET(): Response {
  return Response.json(
    {
      plugin: pluginManifest.version,
      uiKit: UI_KIT_VERSION,
      install: 'claude plugin install pxlkit@pxlkit',
      update: 'claude plugin update pxlkit',
      docs: 'https://pxlkit.xyz/skills',
    },
    { headers: { 'cache-control': 'public, max-age=3600' } },
  );
}
