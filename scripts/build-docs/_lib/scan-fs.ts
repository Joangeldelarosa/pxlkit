import fg from "fast-glob";
import path from "node:path";

const COMPONENT_GLOB = "packages/**/src/**/*.tsx";
const IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/__tests__/**",
  "**/*.stories.tsx",
  "**/*.test.tsx",
  "**/*.spec.tsx",
];

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function manifestSiblingFor(tsxFile: string): string {
  const dir = path.dirname(tsxFile);
  const base = path.basename(tsxFile, ".tsx");
  return path.join(dir, `${base}.manifest.ts`);
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const fs = await import("node:fs/promises");
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns directories that contain BOTH at least one *.tsx and at least one
 * *.manifest.ts sibling. Paths are absolute, POSIX-style.
 */
export async function findComponentDirs(root: string): Promise<string[]> {
  const tsxFiles = await fg(COMPONENT_GLOB, {
    cwd: root,
    ignore: IGNORE,
    absolute: true,
  });

  const dirs = new Set<string>();
  for (const tsx of tsxFiles) {
    const manifest = manifestSiblingFor(tsx);
    if (await fileExists(manifest)) {
      dirs.add(toPosix(path.dirname(tsx)));
    }
  }
  return Array.from(dirs).sort();
}

/**
 * Returns *.tsx files that have NO sibling manifest. Useful for the audit step.
 * Paths are absolute, POSIX-style.
 */
export async function findOrphans(root: string): Promise<string[]> {
  const tsxFiles = await fg(COMPONENT_GLOB, {
    cwd: root,
    ignore: IGNORE,
    absolute: true,
  });

  const orphans: string[] = [];
  for (const tsx of tsxFiles) {
    const manifest = manifestSiblingFor(tsx);
    if (!(await fileExists(manifest))) {
      orphans.push(toPosix(tsx));
    }
  }
  return orphans.sort();
}
