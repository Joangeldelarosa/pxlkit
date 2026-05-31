import * as path from 'node:path';
import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';
import {
  Gate,
  gateFail,
  gateOk,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';
import type { AuditContext, ManifestRecord } from '../_lib/load-context.js';

interface ResolvedComponent {
  component: string;
  file: string | null;
}

async function resolveComponentFile(
  ctx: AuditContext,
  record: ManifestRecord,
): Promise<string | null> {
  if (record.file) {
    const abs = path.isAbsolute(record.file)
      ? record.file
      : path.resolve(ctx.repoRoot, record.file);
    if (await fs.pathExists(abs)) return abs;
  }

  const searchRoots = [ctx.uiKitSrcDir, path.join(ctx.repoRoot, 'packages')];
  const patterns: string[] = [];
  for (const root of searchRoots) {
    if (await fs.pathExists(root)) {
      patterns.push(
        path.posix.join(root.replace(/\\/g, '/'), '**', `${record.component}.tsx`),
      );
    }
  }
  if (patterns.length === 0) return null;

  const hits = await fgGlob(patterns, {
    absolute: true,
    onlyFiles: true,
    dot: false,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.stories.tsx',
      '**/*.test.tsx',
      '**/__tests__/**',
    ],
  });
  return hits[0] ?? null;
}

async function siblingStoryExists(componentFile: string): Promise<boolean> {
  const dir = path.dirname(componentFile);
  const base = path.basename(componentFile, path.extname(componentFile));
  const named = path.join(dir, `${base}.stories.tsx`);
  if (await fs.pathExists(named)) return true;

  const anyStories = await fgGlob('*.stories.tsx', {
    cwd: dir,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });
  return anyStories.length > 0;
}

export class CoverageStoriesGate extends Gate {
  id = 3;
  name = 'coverage-stories';
  description =
    'For each registered component, verify a .stories.tsx exists in same dir as the component. Minor if missing (will be auto-generated in Ola 4c.2).';

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    const resolved: ResolvedComponent[] = [];
    for (const record of ctx.manifests) {
      const file = await resolveComponentFile(ctx, record);
      resolved.push({ component: record.component, file });
    }

    for (const { component, file } of resolved) {
      if (!file) {
        findings.push({
          severity: 'minor',
          component,
          message: `cannot locate component file for "${component}" — unable to verify story coverage`,
          suggestion: `add a "file" field to the manifest entry pointing at the .tsx source for ${component}`,
        });
        continue;
      }

      const hasStory = await siblingStoryExists(file);
      if (!hasStory) {
        const dir = path.relative(ctx.repoRoot, path.dirname(file)) || '.';
        const base = path.basename(file, path.extname(file));
        findings.push({
          severity: 'minor',
          component,
          file: path.relative(ctx.repoRoot, file),
          message: `no .stories.tsx found alongside ${component} (dir: ${dir})`,
          suggestion: `create ${path.posix.join(
            dir.replace(/\\/g, '/'),
            `${base}.stories.tsx`,
          )} — will be auto-generated in Ola 4c.2`,
        });
      }
    }

    const duration_ms = Date.now() - started;
    return findings.length === 0
      ? gateOk(this.name, duration_ms)
      : gateFail(this.name, findings, duration_ms);
  }
}

export default CoverageStoriesGate;
