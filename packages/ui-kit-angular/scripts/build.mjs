// Builds @pxlkit/ui-kit-angular in the Angular Package Format — a partially compiled
// FESM2022 bundle plus bundled typings — into dist/ with ng-packagr.
//
// ng-packagr expects its output folder to be the published package: it writes
// a manifest there, merging in (and warning about) the `exports` of the
// package.json beside ng-package.json. Like every workspace in this monorepo,
// @pxlkit/ui-kit-angular publishes from its root instead — package.json maps
// `exports` into dist/ — so `npm publish -w` and the publish dry-run gate need
// no special case. ng-packagr therefore runs on a temporary project holding a
// copy of ng-package.json and only the manifest fields it reads, and the
// manifest it emits is dropped.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ngPackagr } from 'ng-packagr';

const packageDir = fileURLToPath(new URL('..', import.meta.url));
const readJson = async (file) => JSON.parse(await readFile(join(packageDir, file), 'utf8'));

const manifest = await readJson('package.json');
const ngPackage = await readJson('ng-package.json');

// ng-packagr resolves `dest` and `lib.entryFile` against the folder of its
// ng-package.json, so the temporary project lives inside the package (in the
// git-ignored build/ folder) and both paths are rewritten relative to it.
const workDir = join(packageDir, 'build');
const fromWorkDir = (path) => relative(workDir, resolve(packageDir, path));

await rm(workDir, { recursive: true, force: true });
await mkdir(workDir);
try {
  const { name, version, sideEffects, peerDependencies, dependencies } = manifest;
  await writeFile(
    join(workDir, 'package.json'),
    JSON.stringify({ name, version, sideEffects, peerDependencies, dependencies }),
  );
  await writeFile(
    join(workDir, 'ng-package.json'),
    JSON.stringify({
      ...ngPackage,
      dest: fromWorkDir(ngPackage.dest),
      lib: { ...ngPackage.lib, entryFile: fromWorkDir(ngPackage.lib.entryFile) },
    }),
  );
  await ngPackagr()
    .forProject(join(workDir, 'ng-package.json'))
    .withTsConfig(join(packageDir, 'tsconfig.lib.json'))
    .build();
} finally {
  await rm(workDir, { recursive: true, force: true });
}

// ng-packagr's own manifest and the .npmignore that hides it.
const dest = resolve(packageDir, ngPackage.dest);
await Promise.all(['package.json', '.npmignore'].map((file) => rm(join(dest, file), { force: true })));
