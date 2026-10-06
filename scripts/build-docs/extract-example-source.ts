/**
 * extract-example-source — turn a kit's examples module into the code a
 * reader would paste: one self-contained snippet per example.
 *
 * The SSOT examples are real, runnable components with realistic props,
 * which makes their SOURCE the best usage documentation. Each snippet holds:
 *
 *   1. The imports the example uses, other bindings pruned. Relative
 *      specifiers (the React kit's examples import from its source tree,
 *      `./PixelAreaChart`, `../actions`) become the package name consumers
 *      write, `@pxlkit/ui-kit`; every binding they import is a public export.
 *      Imports that end up from the same module merge into one. A relative
 *      import for its side effects only (`import './demo.css'`) is the
 *      examples module's own setup, which no consumer has: it is dropped.
 *   2. The module-level helpers the example reaches, transitively — sample
 *      data, small components, types — in source order.
 *   3. The example itself.
 *
 * Read from the TypeScript syntax tree, so it serves the React kit's
 * `export function X()` examples and the Angular kit's decorated
 * `export class X {}` ones alike. (The Vue kit's examples are single-file
 * components, one per example: generate-docs-page shows them verbatim.)
 *
 * generate-docs-page embeds the snippets per example on /docs, the first of
 * them as the component's usage lead, which the usage-snippets maps hand to
 * /ui-kit.
 */

import ts from 'typescript';

export interface SelfContainedOptions {
  /** `tsx` for the React kit's examples, `ts` for the Angular kit's. */
  kind: 'tsx' | 'ts';
  /** Specifier that replaces relative import specifiers. */
  packageName?: string;
}

/** Whether an identifier is read as a value or a type, rather than naming a property, attribute or member. */
function isReference(id: ts.Identifier): boolean {
  const parent = id.parent;
  if (ts.isPropertyAccessExpression(parent) && parent.name === id) return false;
  if (ts.isQualifiedName(parent) && parent.right === id) return false;
  if (ts.isJsxAttribute(parent) && parent.name === id) return false;
  if (ts.isBindingElement(parent) && parent.propertyName === id) return false;
  if (
    (ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isPropertySignature(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isMethodSignature(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent) ||
      ts.isEnumMember(parent)) &&
    parent.name === id
  ) {
    return false;
  }
  return true;
}

/**
 * The names a node reads. Conservative: a local that shadows a module-level
 * name counts as reading it, so a snippet may carry a helper it does not
 * need, never miss one it does.
 */
function referencedNames(node: ts.Node): Set<string> {
  const names = new Set<string>();
  const visit = (child: ts.Node): void => {
    if (ts.isIdentifier(child) && isReference(child)) names.add(child.text);
    ts.forEachChild(child, visit);
  };
  visit(node);
  return names;
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) => (ts.isOmittedExpression(element) ? [] : bindingNames(element.name)));
}

/** The names a top-level statement declares. */
function declaredNames(statement: ts.Statement): string[] {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap((declaration) => bindingNames(declaration.name));
  }
  if (
    (ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement)) &&
    statement.name
  ) {
    return [statement.name.text];
  }
  return [];
}

/** What an import statement keeps of its bindings. */
interface PrunedImport {
  /** The module specifier as written, quotes included. */
  from: string;
  typeOnly: boolean;
  /** No bindings: an import for its side effects. */
  bare: boolean;
  defaultName?: string;
  namespace?: string;
  named: string[];
}

/** An import statement keeping only the bindings in `used`, or null when none is. */
function prunedImport(statement: ts.ImportDeclaration, used: ReadonlySet<string>, packageName?: string): PrunedImport | null {
  const written = statement.moduleSpecifier.getText();
  const specifier = (statement.moduleSpecifier as ts.StringLiteral).text;
  const quote = written[0];
  const relative = /^\.{1,2}\//.test(specifier);
  const from = packageName && relative ? `${quote}${packageName}${quote}` : written;
  const clause = statement.importClause;
  if (!clause) return packageName && relative ? null : { from: written, typeOnly: false, bare: true, named: [] };
  const out: PrunedImport = { from, typeOnly: clause.isTypeOnly, bare: false, named: [] };
  if (clause.name && used.has(clause.name.text)) out.defaultName = clause.name.text;
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings) && used.has(bindings.name.text)) out.namespace = bindings.name.text;
  if (bindings && ts.isNamedImports(bindings)) {
    out.named = bindings.elements.filter((element) => used.has(element.name.text)).map((element) => element.getText());
  }
  return out.defaultName || out.namespace || out.named.length > 0 ? out : null;
}

/**
 * The imports as statements, those from the same module (and of the same
 * kind, type-only or not) merged into the first: `import { A } from 'x'`
 * and `import { B } from 'x'` read `import { A, B } from 'x'`. A namespace
 * import stays on its own, as does a second default one.
 */
function importStatements(imports: readonly PrunedImport[]): string[] {
  const merged: PrunedImport[] = [];
  for (const next of imports) {
    const into = merged.find(
      (kept) =>
        !kept.bare &&
        !next.bare &&
        kept.from === next.from &&
        kept.typeOnly === next.typeOnly &&
        !kept.namespace &&
        !next.namespace &&
        !(kept.defaultName && next.defaultName),
    );
    if (into) {
      into.defaultName ??= next.defaultName;
      into.named.push(...next.named.filter((binding) => !into.named.includes(binding)));
    } else {
      merged.push({ ...next, named: [...next.named] });
    }
  }
  return merged.map(({ from, typeOnly, bare, defaultName, namespace, named }) => {
    if (bare) return `import ${from};`;
    const parts = [
      ...(defaultName ? [defaultName] : []),
      ...(namespace ? [`* as ${namespace}`] : []),
      ...(named.length > 0 ? [`{ ${named.join(', ')} }`] : []),
    ];
    return `import ${typeOnly ? 'type ' : ''}${parts.join(', ')} from ${from};`;
  });
}

/**
 * Every top-level declaration of an examples module, keyed by name, as a
 * self-contained snippet (see above). The caller picks the examples by
 * their export names.
 */
export function selfContainedExamples(source: string, { kind, packageName }: SelfContainedOptions): Record<string, string> {
  const file = ts.createSourceFile(
    kind === 'tsx' ? 'examples.tsx' : 'examples.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    kind === 'tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const imports = file.statements.filter(ts.isImportDeclaration);
  const declarations = file.statements
    .filter((statement) => !ts.isImportDeclaration(statement))
    .map((statement) => ({ statement, names: declaredNames(statement), references: referencedNames(statement) }))
    .filter((declaration) => declaration.names.length > 0);
  const declaring = new Map<string, (typeof declarations)[number]>();
  for (const declaration of declarations) for (const name of declaration.names) declaring.set(name, declaration);

  const out: Record<string, string> = {};
  for (const root of declarations) {
    // The declarations the example reaches, transitively.
    const reached = new Set([root]);
    const queue = [root];
    const used = new Set<string>();
    while (queue.length > 0) {
      for (const name of queue.shift()!.references) {
        used.add(name);
        const target = declaring.get(name);
        if (target && !reached.has(target)) {
          reached.add(target);
          queue.push(target);
        }
      }
    }
    const importLines = importStatements(
      imports
        .map((statement) => prunedImport(statement, used, packageName))
        .filter((pruned): pruned is PrunedImport => pruned !== null),
    );
    const bodies = declarations.filter((declaration) => reached.has(declaration)).map(({ statement }) => statement.getText(file));
    const snippet = [importLines.join('\n'), ...bodies].filter(Boolean).join('\n\n') + '\n';
    for (const name of root.names) out[name] = snippet;
  }
  return out;
}
