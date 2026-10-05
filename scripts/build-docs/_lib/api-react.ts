/**
 * The React kit's API: each component's props, read from its props type
 * with the checker, so inherited and `Omit`-ed members resolve as they do
 * for a consumer. Props the kit declares are listed; the native attributes
 * its props type extends (`ButtonHTMLAttributes<HTMLButtonElement>`, …) are
 * summed up in one note, with where `ref` points. Defaults are the ones the
 * implementation destructures (`tone = 'green'`), else a `@default` tag.
 */
import ts from "typescript";
import { KIT_PACKAGES, type ApiComponent, type ApiProp, type ApiReference } from "./api-model.js";
import { isKitDeclaration, moduleExports, type ApiProgram } from "./api-program.js";
import { docOf, printDefault, printSignature, printType, printTypeNode, unionOf } from "./api-print.js";

/** `HTMLButtonElement` → `button`, for the notes. */
const ELEMENT_TAGS: Readonly<Record<string, string>> = {
  HTMLAnchorElement: "a",
  HTMLButtonElement: "button",
  HTMLDivElement: "div",
  HTMLFormElement: "form",
  HTMLHRElement: "hr",
  HTMLImageElement: "img",
  HTMLInputElement: "input",
  HTMLLabelElement: "label",
  HTMLLIElement: "li",
  HTMLOListElement: "ol",
  HTMLParagraphElement: "p",
  HTMLPreElement: "pre",
  HTMLSelectElement: "select",
  HTMLSpanElement: "span",
  HTMLTableElement: "table",
  HTMLTextAreaElement: "textarea",
  HTMLUListElement: "ul",
  SVGSVGElement: "svg",
};

/** `HTMLButtonElement` → `` `<button>` ``; `HTMLElement` → its element. */
export function elementPhrase(element: string): string {
  if (element === "HTMLHeadingElement") return "its heading (`<h1>`–`<h6>`)";
  const tag = ELEMENT_TAGS[element];
  return tag ? `\`<${tag}>\`` : `its element (\`${element}\`)`;
}

/** A native attribute bag the props type extends. */
interface NativeBase {
  /** As written: `ButtonHTMLAttributes<HTMLButtonElement>`. */
  type: string;
  /** Its element type argument, if any. */
  element?: string;
  /** Keys the props type `Omit`s from it. */
  omitted: string[];
}

function literalKeys(type: ts.Type): string[] {
  const members = type.isUnion() ? type.types : [type];
  return members.filter((member) => member.isStringLiteral()).map((member) => (member as ts.StringLiteralType).value);
}

/** The native attribute bags a props type extends, through kit interfaces, intersections and `Omit`. */
function nativeBases(api: ApiProgram, type: ts.Type, omitted: string[], out: NativeBase[], seen: Set<ts.Type>): void {
  if (seen.has(type)) return;
  seen.add(type);
  const { checker } = api;
  const alias = type.aliasSymbol?.name;
  const args = type.aliasTypeArguments ?? [];
  if (alias === "Omit" && args.length === 2) {
    nativeBases(api, args[0]!, [...omitted, ...literalKeys(args[1]!)], out, seen);
    return;
  }
  if ((alias === "PropsWithoutRef" || alias === "PropsWithChildren") && args.length === 1) {
    nativeBases(api, args[0]!, omitted, out, seen);
    return;
  }
  if (type.isIntersection() || type.isUnion()) {
    for (const member of type.types) nativeBases(api, member, omitted, out, seen);
    return;
  }
  // The type's own symbol: a kit alias of a native bag (`PixelBareButtonProps =
  // React.ButtonHTMLAttributes<HTMLButtonElement>`) is that bag.
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  const declaration = symbol?.declarations?.[0];
  if (!symbol || !declaration) return;
  if (!isKitDeclaration(declaration, api.repoRoot)) {
    if (/Attributes$/.test(symbol.name) && symbol.name !== "RefAttributes") {
      const args = typeArguments(checker, type);
      const element = args[0];
      out.push({
        // The bag by its own name, not a kit alias of it.
        type: args.length ? `${symbol.name}<${args.map((arg) => checker.typeToString(arg)).join(", ")}>` : symbol.name,
        ...(element ? { element: elementName(checker, element) } : {}),
        omitted,
      });
    }
    return;
  }
  if (type.isClassOrInterface()) {
    for (const base of checker.getBaseTypes(type)) nativeBases(api, base, omitted, out, seen);
  }
}

function typeArguments(checker: ts.TypeChecker, type: ts.Type): readonly ts.Type[] {
  if (type.aliasTypeArguments) return type.aliasTypeArguments;
  return type.flags & ts.TypeFlags.Object && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference
    ? checker.getTypeArguments(type as ts.TypeReference)
    : [];
}

/** An element type's name: a local alias (`CardRoot`) reads as what it stands for. */
function elementName(checker: ts.TypeChecker, element: ts.Type): string {
  const type = checker.getNonNullableType(element);
  const members = type.isUnion() ? type.types : [type];
  return members.map((member) => checker.typeToString(member)).join(" | ");
}

/** The element a `RefAttributes<T>` / `{ ref?: Ref<T> }` member points `ref` at. */
function refElement(api: ApiProgram, ref: ts.Symbol, at: ts.Node): string | undefined {
  const { checker } = api;
  const type = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(ref, at));
  const members = type.isUnion() ? type.types : [type];
  for (const member of members) {
    const args = typeArguments(checker, member);
    const element = args?.[0];
    if (element) return elementName(checker, element);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Defaults the implementation destructures
// ---------------------------------------------------------------------------

/** The function that renders a component: through `forwardRef`/`memo` calls, casts and aliases. */
function implementationOf(api: ApiProgram, node: ts.Node | undefined, depth = 0): ts.SignatureDeclaration | undefined {
  if (!node || depth > 16) return undefined;
  const { checker } = api;
  if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return node;
  if (ts.isVariableDeclaration(node)) return implementationOf(api, node.initializer, depth + 1);
  if (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return implementationOf(api, node.expression, depth + 1);
  }
  if (ts.isCallExpression(node)) return implementationOf(api, node.arguments[0], depth + 1);
  if (ts.isIdentifier(node)) {
    let symbol = checker.getSymbolAtLocation(node);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    return implementationOf(api, symbol?.valueDeclaration, depth + 1);
  }
  return undefined;
}

function bindingDefaults(api: ApiProgram, pattern: ts.ObjectBindingPattern, out: Map<string, string>): void {
  for (const element of pattern.elements) {
    if (element.dotDotDotToken || !element.initializer) continue;
    const key = element.propertyName ?? element.name;
    if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) continue;
    const value = printDefault(element.initializer, api.checker);
    if (value !== undefined) out.set(key.text, value);
  }
}

/** Prop name → default, from the implementation's destructuring (of its parameter, or of `props` in its body). */
function implementationDefaults(api: ApiProgram, implementation: ts.SignatureDeclaration | undefined): Map<string, string> {
  const out = new Map<string, string>();
  const first = implementation?.parameters[0];
  if (!implementation || !first) return out;
  if (ts.isObjectBindingPattern(first.name)) {
    bindingDefaults(api, first.name, out);
  } else if (ts.isIdentifier(first.name) && "body" in implementation && implementation.body) {
    const props = first.name.text;
    const isProps = (node: ts.Expression): boolean => {
      // `const { … } = props as InternalProps` destructures the props too.
      let inner = node;
      while (ts.isAsExpression(inner) || ts.isSatisfiesExpression(inner) || ts.isParenthesizedExpression(inner) || ts.isNonNullExpression(inner)) {
        inner = inner.expression;
      }
      return ts.isIdentifier(inner) && inner.text === props;
    };
    const visit = (node: ts.Node): void => {
      if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer && isProps(node.initializer)) {
        bindingDefaults(api, node.name, out);
      }
      if (!ts.isFunctionLike(node) || node === implementation) ts.forEachChild(node, visit);
    };
    ts.forEachChild(implementation.body, visit);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** The declared type of one kit declaration of a prop. */
function declaredType(api: ApiProgram, declaration: ts.Declaration, symbol: ts.Symbol, optional: boolean): string {
  const { checker } = api;
  if ((ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)) && declaration.type) {
    return printTypeNode(declaration.type, checker, { optional });
  }
  if (ts.isMethodSignature(declaration) || ts.isMethodDeclaration(declaration)) return printSignature(declaration, checker);
  return printType(checker.getTypeOfSymbolAtLocation(symbol, declaration), checker, { optional });
}

/** The props type of a component value, if it is one (it can be called with props). */
function propsTypeOf(api: ApiProgram, symbol: ts.Symbol): { type: ts.Type; at: ts.Node } | undefined {
  const { checker } = api;
  const at = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!at) return undefined;
  const signature = checker.getTypeOfSymbolAtLocation(symbol, at).getCallSignatures()[0];
  if (!signature) return undefined;
  const props = signature.getParameters()[0];
  return props ? { type: checker.getTypeOfSymbolAtLocation(props, at), at } : { type: checker.getAnyType(), at };
}

/** A component's API: its props, and notes on what else it takes. */
export function componentApi(api: ApiProgram, name: string, symbol: ts.Symbol): ApiComponent | undefined {
  const { checker } = api;
  const resolved = propsTypeOf(api, symbol);
  if (!resolved) return undefined;
  const { type, at } = resolved;
  const defaults = implementationDefaults(api, implementationOf(api, symbol.valueDeclaration));
  // A union of prop bags (single vs multiple selection, …): a prop is
  // required only where every bag requires it.
  const bags = type.isUnion() ? type.types : [type];
  const byName = new Map<string, { symbols: ts.Symbol[]; required: boolean }>();
  for (const bag of bags) {
    for (const prop of checker.getPropertiesOfType(bag)) {
      const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
      const entry = byName.get(prop.name);
      if (entry) {
        entry.symbols.push(prop);
        entry.required &&= !optional;
      } else {
        byName.set(prop.name, { symbols: [prop], required: !optional });
      }
    }
  }
  const props: ApiProp[] = [];
  let ref: string | undefined;
  // Native attributes the component gives a default of its own (`type = 'button'`).
  const nativeDefaults: string[] = [];
  for (const [propName, { symbols, required: requiredInEvery }] of byName) {
    const required = requiredInEvery && symbols.length === bags.length;
    if (propName === "ref") {
      ref = refElement(api, symbols[0]!, at);
      continue;
    }
    if (propName === "key") continue;
    const kitDeclarations = symbols.flatMap((symbol) =>
      (symbol.declarations ?? []).filter((declaration) => isKitDeclaration(declaration, api.repoRoot)).map((declaration) => ({ symbol, declaration })),
    );
    if (kitDeclarations.length === 0) {
      const fallback = defaults.get(propName);
      if (fallback !== undefined) nativeDefaults.push(`\`${propName}\` defaults to \`${fallback}\``);
      continue;
    }
    const doc = docOf(symbols[0], checker);
    if (doc.internal) continue;
    // One declaration, or one per bag of a union, each printed whole.
    const type = unionOf(kitDeclarations.map(({ symbol, declaration }) => declaredType(api, declaration, symbol, !required)));
    const fallback = defaults.get(propName) ?? doc.default;
    props.push({
      name: propName,
      type,
      ...(fallback !== undefined ? { default: fallback } : {}),
      ...(required ? { required: true } : {}),
      description: doc.description,
      ...(doc.deprecated ? { deprecated: doc.deprecated } : {}),
    });
  }
  const notes: string[] = [];
  const bases: NativeBase[] = [];
  nativeBases(api, type, [], bases, new Set());
  const declared = new Set(props.map((prop) => prop.name));
  bases.forEach((base, index) => {
    const tag = base.element ? ELEMENT_TAGS[base.element] : undefined;
    const omitted = base.omitted.filter((key) => !declared.has(key));
    notes.push(
      `Also takes the native attributes and event handlers of ${tag ? `\`<${tag}>\`` : "its element"} (\`${base.type}\`)${
        omitted.length ? `, except ${omitted.map((key) => `\`${key}\``).join(", ")}` : ""
      }${index === 0 && nativeDefaults.length ? `; ${nativeDefaults.join(", ")}` : ""}.`,
    );
  });
  if (ref) notes.push(`\`ref\` points to ${elementPhrase(ref)}.`);
  return { name, props, events: [], slots: [], notes };
}

/** The static parts a compound component carries (`PixelPopover.Trigger`), with their values. */
function staticParts(api: ApiProgram, name: string, symbol: ts.Symbol): Array<{ name: string; symbol: ts.Symbol }> {
  const { checker } = api;
  const at = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!at) return [];
  const out: Array<{ name: string; symbol: ts.Symbol }> = [];
  for (const member of checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(symbol, at))) {
    if (!/^[A-Z]/.test(member.name)) continue;
    const declaration = member.declarations?.[0];
    if (!declaration || !isKitDeclaration(declaration, api.repoRoot)) continue;
    // `Trigger: typeof PixelPopoverTrigger` in the component's type, or an
    // assignment `PixelDropdown.Root = DropdownRoot`: the value is the part.
    let value: ts.Symbol | undefined;
    if (ts.isPropertySignature(declaration) && declaration.type && ts.isTypeQueryNode(declaration.type)) {
      value = checker.getSymbolAtLocation(declaration.type.exprName);
    } else if (ts.isBinaryExpression(declaration.parent) && ts.isIdentifier(declaration.parent.right)) {
      value = checker.getSymbolAtLocation(declaration.parent.right);
    }
    if (value && value.flags & ts.SymbolFlags.Alias) value = checker.getAliasedSymbol(value);
    if (value && propsTypeOf(api, value)) out.push({ name: `${name}.${member.name}`, symbol: value });
  }
  return out;
}

/** The manifest name a part belongs to: the longest one its name starts with. */
export function ownerOf(part: string, names: readonly string[]): string | undefined {
  let owner: string | undefined;
  for (const name of names) {
    if (part !== name && part.startsWith(name) && /^[A-Z]/.test(part.slice(name.length)) && (!owner || name.length > owner.length)) {
      owner = name;
    }
  }
  return owner;
}

/** Each documented component's React API: the component, its static parts, then the parts exported beside it. */
export function reactApis(api: ApiProgram, names: readonly string[]): Map<string, ApiReference> {
  const out = new Map<string, ApiReference>();
  const entry = api.entries.react;
  if (!entry) return out;
  const exports = moduleExports(api, entry);
  const documented = new Set(names);
  const exportedParts = new Map<string, Array<{ name: string; symbol: ts.Symbol }>>();
  for (const [exportName, symbol] of exports) {
    if (documented.has(exportName) || !(symbol.flags & ts.SymbolFlags.Value)) continue;
    const owner = ownerOf(exportName, names);
    if (!owner || !propsTypeOf(api, symbol)) continue;
    exportedParts.set(owner, [...(exportedParts.get(owner) ?? []), { name: exportName, symbol }]);
  }
  for (const name of names) {
    const symbol = exports.get(name);
    if (!symbol) continue;
    const main = componentApi(api, name, symbol);
    if (!main) continue;
    // A part that is the component itself (`PixelForm.Root`) is another name for it.
    const implementation = implementationOf(api, symbol.valueDeclaration);
    const statics = staticParts(api, name, symbol).filter((part) => {
      if (!implementation || implementationOf(api, part.symbol.valueDeclaration) !== implementation) return true;
      main.notes.push(`\`${part.name}\` is the same component.`);
      return false;
    });
    // Parts exported by name too (`PixelFormField`) are documented under their static name.
    const covered = new Set(
      [implementation, ...statics.map((part) => implementationOf(api, part.symbol.valueDeclaration))].filter(Boolean),
    );
    const parts = [
      ...statics,
      ...(exportedParts.get(name) ?? [])
        .filter((part) => !covered.has(implementationOf(api, part.symbol.valueDeclaration)))
        .sort((a, b) => comparePosition(a.symbol, b.symbol)),
    ];
    const components = [main];
    for (const part of parts) {
      const component = componentApi(api, part.name, part.symbol);
      if (component) components.push(component);
    }
    const imports = [name, ...parts.filter((part) => !part.name.includes(".")).map((part) => part.name)];
    out.set(name, { import: `import { ${imports.join(", ")} } from '${KIT_PACKAGES.react}';`, components });
  }
  return out;
}

/** Orders parts as their modules declare them: by file, then by place in it. */
function comparePosition(a: ts.Symbol, b: ts.Symbol): number {
  const at = (symbol: ts.Symbol) => symbol.valueDeclaration ?? symbol.declarations?.[0];
  const first = at(a);
  const second = at(b);
  if (!first || !second) return 0;
  const [fileA, fileB] = [first.getSourceFile().fileName, second.getSourceFile().fileName];
  return fileA === fileB ? first.getStart() - second.getStart() : fileA < fileB ? -1 : 1;
}

