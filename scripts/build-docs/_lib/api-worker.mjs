/**
 * Worker thread of extract-api.ts: reads the kits' APIs off the docs build's
 * main thread and posts the index back, or the error that stopped it.
 *
 * Plain JavaScript, because Node loads a worker's entry itself: the
 * TypeScript loader the build runs under (tsx) does not reach worker
 * threads, so this one registers it before it loads the reader. When the
 * reader cannot load here, it says so, and the main thread reads instead.
 */
import { createRequire } from "node:module";
import { parentPort, workerData } from "node:worker_threads";

const { repoRoot, names } = workerData;

let readApis;
try {
  const { register } = await import("tsx/cjs/api");
  register();
  ({ readApis } = createRequire(import.meta.url)("./api-read.ts"));
} catch {
  parentPort.postMessage({ unavailable: true });
}

if (readApis) {
  try {
    parentPort.postMessage({ index: readApis(repoRoot, names) });
  } catch (error) {
    parentPort.postMessage({ error: error instanceof Error ? (error.stack ?? error.message) : String(error) });
  }
}
