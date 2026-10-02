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

/** An import statement keeping only the bindings in `used`, or null when none is. */
function prunedImport(statement: ts.ImportDeclaration, used: ReadonlySet<string>, packageName?: string): string | null {
  const written = statement.moduleSpecifier.getText();
  const specifier = (statement.moduleSpecifier as ts.StringLiteral).text;
  const quote = written[0];
  const from = packageName && /^\.{1,2}\//.test(specifier) ? `${quote}${packageName}${quote}` : written;
  const clause = statement.importClause;
  if (!clause) return `import ${from};`;
  const parts: string[] = [];
  if (clause.name && used.has(clause.name.text)) parts.push(clause.name.text);
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings) && used.has(bindings.name.text)) parts.push(`* as ${bindings.name.text}`);
  if (bindings && ts.isNamedImports(bindings)) {
    const named = bindings.elements.filter((element) => used.has(element.name.text)).map((element) => element.getText());
    if (named.length > 0) parts.push(`{ ${named.join(', ')} }`);
  }
  if (parts.length === 0) return null;
  return `import ${clause.isTypeOnly ? 'type ' : ''}${parts.join(', ')} from ${from};`;
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
    const importLines = imports
      .map((statement) => prunedImport(statement, used, packageName))
      .filter((line): line is string => line !== null);
    const bodies = declarations.filter((declaration) => reached.has(declaration)).map(({ statement }) => statement.getText(file));
    const snippet = [importLines.join('\n'), ...bodies].filter(Boolean).join('\n\n') + '\n';
    for (const name of root.names) out[name] = snippet;
  }
  return out;
}
