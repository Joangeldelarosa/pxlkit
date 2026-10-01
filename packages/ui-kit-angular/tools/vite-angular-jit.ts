/**
 * Vite plugin that compiles the kit's Angular sources for the test suites in
 * JIT mode, from source — no prior build.
 *
 * Each TypeScript file of the tsconfig's program is emitted by the TypeScript
 * compiler with the transform the Angular CLI uses for JIT applications
 * (`constructorParametersDownlevelTransform` from `@angular/compiler-cli`):
 * it turns signal inputs, models, outputs and queries into the decorator
 * metadata the JIT compiler reads, so `input()`, `model()`, `output()` and
 * signal queries behave exactly as in an AOT build. Templates are inline and
 * compiled at runtime by `@angular/compiler`.
 *
 * Template type checking is not this plugin's job: `npm run lint` (ngc with
 * strict templates) and the ng-packagr build compile everything ahead of time.
 */
import { constructorParametersDownlevelTransform } from '@angular/compiler-cli/private/tooling';
import ts from 'typescript';
import type { Plugin } from 'vite';

export interface AngularJitOptions {
  /** Absolute path of the tsconfig whose program holds the files to compile. */
  tsconfig: string;
}

export function angularJit({ tsconfig }: AngularJitOptions): Plugin {
  const config = ts.getParsedCommandLineOfConfigFile(tsconfig, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  });
  if (!config) throw new Error(`Cannot read ${tsconfig}`);

  const options: ts.CompilerOptions = {
    ...config.options,
    noEmit: false,
    declaration: false,
    declarationMap: false,
    emitDeclarationOnly: false,
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: true,
    importHelpers: false,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  };

  let program: ts.Program | undefined;
  let previous: ts.Program | undefined;
  const programFiles = () => {
    program ??= ts.createProgram({ rootNames: config.fileNames, options, oldProgram: previous });
    return program;
  };

  return {
    name: 'pxlkit:angular-jit',
    enforce: 'pre',
    watchChange() {
      previous = program ?? previous;
      program = undefined;
    },
    transform(_code, id) {
      const file = id.split('?')[0]!;
      if (!file.endsWith('.ts') || file.endsWith('.d.ts') || file.includes('/node_modules/')) return null;
      const current = programFiles();
      const source = current.getSourceFile(file);
      if (!source) return null;

      let code = '';
      let map: string | undefined;
      current.emit(
        source,
        (name, text) => {
          if (name.endsWith('.js.map')) map = text;
          else if (name.endsWith('.js')) code = text.replace(/\/\/# sourceMappingURL=.*$/m, '');
        },
        undefined,
        false,
        { before: [constructorParametersDownlevelTransform(current)] },
      );
      return { code, map };
    },
  };
}
