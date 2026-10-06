/**
 * Reads the API index from the kits' sources: one TypeScript program over
 * the three kits (api-program.ts), then each framework's reader. Apart from
 * extract-api.ts, which loads it on demand: the docs build reads in a worker
 * thread, and its main thread never loads the compilers this needs.
 */
import path from "node:path";
import { API_FRAMEWORKS, type ApiIndex, type ComponentApi } from "./api-model.js";
import { createApiProgram, hasKit } from "./api-program.js";
import { reactApis } from "./api-react.js";
import { vueApis } from "./api-vue.js";
import { angularApis } from "./api-angular.js";

/** The API of each named component, in each framework whose kit is in `repoRoot`. */
export function readApis(repoRoot: string, names: readonly string[]): ApiIndex {
  const root = path.resolve(repoRoot);
  const index = new Map<string, ComponentApi>();
  // No kit to read (a repository without them): no program to build.
  if (!hasKit(root)) {
    for (const name of names) index.set(name, {});
    return index;
  }
  const api = createApiProgram(root);
  const byFramework = {
    react: reactApis(api, names),
    vue: vueApis(api, names),
    angular: angularApis(api, names),
  };
  for (const name of names) {
    const component: ComponentApi = {};
    for (const framework of API_FRAMEWORKS) {
      const reference = byFramework[framework].get(name);
      if (reference) component[framework] = reference;
    }
    index.set(name, component);
  }
  return index;
}
