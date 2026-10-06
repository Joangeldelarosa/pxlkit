/**
 * extract-api — the API reference of every documented component, in React,
 * Vue and Angular, read from the kits' sources at docs-build time.
 *
 * One TypeScript program over the three kits (_lib/api-program.ts) gives:
 *   - React    props from each component's props type: the kit's own props
 *              with their types, defaults (destructured, or `@default`) and
 *              doc comments; the native attributes it extends in one note
 *              (_lib/api-react.ts);
 *   - Vue      `defineProps` / `withDefaults`, `defineEmits`, `defineSlots`,
 *              `defineModel`, attribute fallthrough and `defineExpose`, or a
 *              `defineComponent`'s options; `update:x` events name the
 *              `v-model` bindings (_lib/api-vue.ts);
 *   - Angular  the selector, `input()` / `input.required()` with what their
 *              transforms accept, `model()` (`[(x)]`), `output()`, projected
 *              content and `ControlValueAccessor` support (_lib/api-angular.ts).
 * Each component comes with its parts (`PixelPopover.Trigger`,
 * `PixelPopoverTrigger`, …).
 *
 * The step writes nothing: it starts the extraction in a worker thread and
 * returns, so the steps after it run meanwhile; generate-docs-page waits for
 * the references and renders them into the /docs sections. The coherence
 * audit reads them through `extractApi`.
 *
 * CLI (inspection):
 *   tsx scripts/build-docs/extract-api.ts [--root <dir>] [--json]
 *                                         [--component <Name>] [--undocumented]
 */
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";

import { Generator, type GeneratorContext, type GeneratorResult, type ManifestRecord } from "./_lib/generator-base.js";
import { createLogger, type Logger } from "./_lib/logger.js";
import { API_FRAMEWORKS, undocumentedMembers, type ApiIndex, type UndocumentedMember } from "./_lib/api-model.js";
import { scanManifests } from "./scan-manifests.js";

export type { ApiIndex, ComponentApi } from "./_lib/api-model.js";

/** The manifest names to document, sorted. */
export function documentedNames(manifests: readonly ManifestRecord[]): string[] {
  const names = manifests
    .map((record) => (record.manifest as { name?: unknown }).name)
    .filter((name): name is string => typeof name === "string");
  return [...new Set(names)].sort();
}

/**
 * The API of each named component, in each framework whose kit is in
 * `repoRoot`. The reader (_lib/api-read.ts) loads on the first call, with
 * the compilers it needs.
 */
export async function extractApi(repoRoot: string, names: readonly string[]): Promise<ApiIndex> {
  const { readApis } = await import("./_lib/api-read.js");
  return readApis(repoRoot, names);
}

/** An index, and the thread that read it. */
interface Read {
  index: ApiIndex;
  thread: "worker" | "main";
}

/** A run's extraction, shared by the steps that need it. */
interface Extraction {
  read: Promise<Read>;
  started: number;
  /** Milliseconds it took, once done. */
  duration?: number;
  reported: boolean;
}

const extractions = new WeakMap<GeneratorContext, Extraction>();

/** What the worker (_lib/api-worker.mjs) posts back. */
interface WorkerMessage {
  index?: ApiIndex;
  /** Why reading failed. */
  error?: string;
  /** The reader would not load in the worker. */
  unavailable?: boolean;
}

/**
 * Reads the APIs in a worker thread, so the steps after extract-api run
 * meanwhile; in this thread when no worker can start or load the reader.
 */
function extractInWorker(repoRoot: string, names: readonly string[]): Promise<Read> {
  return new Promise<Read>((resolve, reject) => {
    let settled = false;
    const settle = (finish: () => void) => {
      if (settled) return;
      settled = true;
      finish();
    };
    const inThread = () =>
      settle(() => extractApi(repoRoot, names).then((index) => resolve({ index, thread: "main" }), reject));
    let worker: Worker;
    try {
      worker = new Worker(new URL("./_lib/api-worker.mjs", import.meta.url), { workerData: { repoRoot, names: [...names] } });
    } catch {
      inThread();
      return;
    }
    worker.once("message", (message: WorkerMessage) => {
      if (message.index) settle(() => resolve({ index: message.index!, thread: "worker" }));
      else if (message.error !== undefined) settle(() => reject(new Error(message.error)));
      else inThread();
    });
    worker.once("error", inThread);
    worker.once("exit", inThread);
  });
}

function track(read: Promise<Read>): Extraction {
  const extraction: Extraction = { read, started: performance.now(), reported: false };
  // Settled here too, so a run that never awaits it (`--only=api`) reports no unhandled rejection.
  read.then(
    () => {
      extraction.duration = performance.now() - extraction.started;
    },
    () => undefined,
  );
  return extraction;
}

/** Starts reading the run's APIs, without waiting for them. */
export function startApiExtraction(ctx: GeneratorContext): void {
  if (!extractions.has(ctx)) {
    extractions.set(ctx, track(extractInWorker(ctx.repoRoot, documentedNames(ctx.manifests))));
  }
}

/** The run's API index: the extraction the extract-api step started, else one made now. */
export async function apiIndexFor(ctx: GeneratorContext): Promise<ApiIndex> {
  let extraction = extractions.get(ctx);
  if (!extraction) {
    extraction = track(
      extractApi(ctx.repoRoot, documentedNames(ctx.manifests)).then((index): Read => ({ index, thread: "main" })),
    );
    extractions.set(ctx, extraction);
  }
  const { index, thread } = await extraction.read;
  if (!extraction.reported) {
    extraction.reported = true;
    const counts = API_FRAMEWORKS.map(
      (framework) => `${framework} ${[...index.values()].filter((api) => api[framework]).length}`,
    ).join(", ");
    const seconds = ((extraction.duration ?? performance.now() - extraction.started) / 1000).toFixed(1);
    ctx.logger.info(
      `  extract-api: ${index.size} components (${counts}) read in ${seconds}s (${thread} thread); ${undocumented(index).length} props, events or slots without a description`,
    );
  }
  return index;
}

/** Every member without a description, all components together. */
export function undocumented(index: ApiIndex): Array<UndocumentedMember & { owner: string }> {
  return [...index].flatMap(([owner, api]) => undocumentedMembers(api).map((member) => ({ owner, ...member })));
}

/**
 * Starts reading the APIs in a worker thread and returns at once: the steps
 * that follow run meanwhile, and generate-docs-page waits for them.
 */
export class ExtractApiGenerator extends Generator {
  name = "extract-api";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    startApiExtraction(ctx);
    return { writes: [] };
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const SILENT_LOGGER: Logger = { info() {}, warn() {}, error() {}, success() {}, table() {} };

interface CliArgs {
  root: string;
  json: boolean;
  component?: string;
  undocumented: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { root: process.cwd(), json: false, undocumented: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--json") args.json = true;
    else if (arg === "--undocumented") args.undocumented = true;
    else if (arg === "--root") args.root = path.resolve(argv[++i] ?? args.root);
    else if (arg === "--component") args.component = argv[++i];
  }
  return args;
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);
  const logger = createLogger("extract-api");
  // Machine-readable output owns stdout: the scan reports nothing there.
  const quiet = args.json || args.undocumented;
  const manifests = await scanManifests(args.root, { continueOnError: true, logger: quiet ? SILENT_LOGGER : logger });
  const names = documentedNames(manifests).filter((name) => !args.component || name === args.component);
  const index = await extractApi(args.root, names);
  if (args.undocumented) {
    for (const member of undocumented(index)) {
      // eslint-disable-next-line no-console
      console.log(`${member.framework}\t${member.owner}\t${member.component}\t${member.kind}\t${member.name}`);
    }
  } else if (args.json) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(Object.fromEntries(index), null, 2));
  } else {
    for (const [name, api] of index) {
      const frameworks = API_FRAMEWORKS.map((framework) => {
        const components = api[framework]?.components ?? [];
        const members = components.reduce((sum, c) => sum + c.props.length + c.events.length + c.slots.length, 0);
        return `${framework} ${components.length ? `${members} in ${components.length}` : "—"}`;
      });
      logger.info(`${name}: ${frameworks.join(" | ")}`);
    }
  }
  return 0;
}

if (
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run().then(
    (code) => process.exit(code),
    (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    },
  );
}
