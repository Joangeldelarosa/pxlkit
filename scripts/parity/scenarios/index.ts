/**
 * Interaction scenarios, one or more modules per category (`<category>.ts`,
 * `<category>-<part>.ts`), each exporting `scenarios`. Each scenario starts
 * from a manifest example and is replayed on React, Vue and Angular; the DOM
 * must match after every step.
 */
/// <reference types="vite/client" />
import type { ParityScenario } from '../interact';

const modules = import.meta.glob<{ scenarios: readonly ParityScenario[] }>(['./*.ts', '!./index.ts'], { eager: true });

export const scenarios: readonly ParityScenario[] = Object.keys(modules)
  .sort()
  .flatMap((path) => modules[path]!.scenarios);
