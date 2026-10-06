/**
 * The Angular kit's API: each component's or directive's selector, its
 * signal inputs (`input()`, `input.required()`, with what a transform
 * accepts), two-way `model()`s (`[(x)]`, with their `xChange` output),
 * `output()`s, the content it projects (`<ng-content>`, read with Angular's
 * template parser) and whether it is a form control (`ControlValueAccessor`).
 */
import ts from "typescript";
import { CssSelector, TmplAstRecursiveVisitor, parseTemplate, tmplAstVisitAll, type TmplAstContent } from "@angular/compiler";
import { KIT_PACKAGES, type ApiComponent, type ApiEvent, type ApiProp, type ApiReference } from "./api-model.js";
import { moduleExports, type ApiProgram } from "./api-program.js";
import { docOfDeclaration, joinUnion, nodeText, printDefault, printType, printTypeNode, propertyName } from "./api-print.js";
import { ownerOf } from "./api-react.js";

/** The signal factories Angular declares members with. */
type MemberKind = "input" | "model" | "output";

interface Decorated {
  kind: "Component" | "Directive";
  options: ts.ObjectLiteralExpression;
}

function decoratorOf(declaration: ts.ClassDeclaration): Decorated | undefined {
  for (const decorator of ts.getDecorators(declaration) ?? []) {
    const call = decorator.expression;
    if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression)) continue;
    const kind = call.expression.text;
    const options = call.arguments[0];
    if ((kind === "Component" || kind === "Directive") && options && ts.isObjectLiteralExpression(options)) {
      return { kind, options };
    }
  }
  return undefined;
}

function option(options: ts.ObjectLiteralExpression, key: string): ts.Expression | undefined {
  return options.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && propertyName(p.name) === key)
    ?.initializer;
}

function stringValue(node: ts.Expression | undefined): string | undefined {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
}

/** The class an export names, through `export const PxlKitButton = PixelIconButton`. */
function classOf(api: ApiProgram, symbol: ts.Symbol | undefined, depth = 0): ts.ClassDeclaration | undefined {
  if (!symbol || depth > 4) return undefined;
  const { checker } = api;
  if (symbol.flags & ts.SymbolFlags.Alias) return classOf(api, checker.getAliasedSymbol(symbol), depth + 1);
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return undefined;
  if (ts.isClassDeclaration(declaration)) return decoratorOf(declaration) ? declaration : undefined;
  if (ts.isVariableDeclaration(declaration) && declaration.initializer && ts.isIdentifier(declaration.initializer)) {
    return classOf(api, checker.getSymbolAtLocation(declaration.initializer), depth + 1);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

/** `input(…)` / `input.required(…)` / `model(…)` / `output(…)`: its kind and whether required. */
function factoryOf(call: ts.CallExpression): { kind: MemberKind; required: boolean } | undefined {
  const callee = call.expression;
  if (ts.isIdentifier(callee) && (callee.text === "input" || callee.text === "model" || callee.text === "output")) {
    return { kind: callee.text, required: false };
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    (callee.expression.text === "input" || callee.expression.text === "model") &&
    callee.name.text === "required"
  ) {
    return { kind: callee.expression.text, required: true };
  }
  return undefined;
}

function typeArgumentsOf(checker: ts.TypeChecker, type: ts.Type): readonly ts.Type[] {
  if (type.aliasTypeArguments) return type.aliasTypeArguments;
  return type.flags & ts.TypeFlags.Object && (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference
    ? checker.getTypeArguments(type as ts.TypeReference)
    : [];
}

/**
 * The value type and, for a transformed input, the type it accepts: as
 * declared, else as the checker infers them — asked only then, as inferring
 * is the costly part.
 */
function signalTypes(
  api: ApiProgram,
  member: ts.PropertyDeclaration,
  call: ts.CallExpression,
  transformed: boolean,
): { value: string; accepts?: string } {
  const { checker } = api;
  const [valueNode, acceptsNode] = call.typeArguments ?? [];
  let inferred: readonly ts.Type[] | undefined;
  const infer = (index: number): ts.Type | undefined =>
    (inferred ??= typeArgumentsOf(checker, checker.getTypeAtLocation(member.name)))[index];
  const valueType = valueNode ? undefined : infer(0);
  const value = valueNode
    ? printTypeNode(valueNode, checker, { optional: true })
    : valueType
      ? printType(valueType, checker, { optional: true })
      : "unknown";
  const acceptedType = acceptsNode || !transformed ? undefined : infer(1);
  const accepted = acceptsNode
    ? printTypeNode(acceptsNode, checker, { optional: true })
    : acceptedType
      ? printType(acceptedType, checker, { optional: true })
      : undefined;
  // `T | undefined` only says the input may stay unset: it accepts the same.
  const same = (a: string, b: string) =>
    joinUnion(a.split(" | ").filter((m) => m !== "undefined" && m !== "null")) ===
    joinUnion(b.split(" | ").filter((m) => m !== "undefined" && m !== "null"));
  return accepted && !same(accepted, value) ? { value, accepts: accepted } : { value };
}

/** The options a factory takes (`{ alias, transform }`): second for `input(v, …)`/`model(v, …)`, first otherwise. */
function optionsArgument(call: ts.CallExpression, kind: MemberKind, required: boolean): ts.Expression | undefined {
  return call.arguments[kind === "output" || required ? 0 : 1];
}

/** Whether the options may set a `transform`: they do, or are not written in place (a variable, a spread). */
function mayTransform(argument: ts.Expression | undefined): boolean {
  if (!argument) return false;
  if (!ts.isObjectLiteralExpression(argument)) return true;
  return argument.properties.some(
    (property) => ts.isSpreadAssignment(property) || (property.name !== undefined && propertyName(property.name) === "transform"),
  );
}

interface Members {
  props: ApiProp[];
  events: ApiEvent[];
}

/** Adds a member, or replaces the one a base class declared under its name. */
function upsert<T extends { name: string }>(list: T[], item: T): void {
  const index = list.findIndex((existing) => existing.name === item.name);
  if (index >= 0) list.splice(index, 1, item);
  else list.push(item);
}

/** A class and the kit classes it extends, base first: a directive inherits their inputs and outputs. */
function classChain(api: ApiProgram, declaration: ts.ClassDeclaration, depth = 0): ts.ClassDeclaration[] {
  const heritage = declaration.heritageClauses?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword);
  const base = heritage?.types[0]?.expression;
  let symbol = base ? api.checker.getSymbolAtLocation(base) : undefined;
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = api.checker.getAliasedSymbol(symbol);
  const baseClass = symbol?.declarations?.find(ts.isClassDeclaration);
  return baseClass && depth < 4 ? [...classChain(api, baseClass, depth + 1), declaration] : [declaration];
}

function membersOf(api: ApiProgram, declaration: ts.ClassDeclaration): Members {
  const { checker } = api;
  const props: ApiProp[] = [];
  const events: ApiEvent[] = [];
  const changes: ApiEvent[] = [];
  for (const member of classChain(api, declaration).flatMap((c) => [...c.members])) {
    if (!ts.isPropertyDeclaration(member) || !member.initializer || !ts.isCallExpression(member.initializer)) continue;
    const modifiers = ts.getCombinedModifierFlags(member);
    if (modifiers & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) continue;
    const call = member.initializer;
    const factory = factoryOf(call);
    if (!factory) continue;
    const doc = docOfDeclaration(member, checker);
    if (doc.internal) continue;
    const argument = optionsArgument(call, factory.kind, factory.required);
    const options = argument && ts.isObjectLiteralExpression(argument) ? argument : undefined;
    const alias = options ? stringValue(option(options, "alias")) : undefined;
    const name = alias ?? propertyName(member.name);
    if (factory.kind === "output") {
      const payloadNode = call.typeArguments?.[0];
      const payload = payloadNode ? printTypeNode(payloadNode, checker) : "";
      upsert(events, {
        name,
        payload: payload === "void" ? "" : payload,
        description: doc.description,
        ...(doc.deprecated ? { deprecated: doc.deprecated } : {}),
      });
      continue;
    }
    const { value, accepts } = signalTypes(api, member, call, mayTransform(argument));
    const initial = factory.required ? undefined : call.arguments[0];
    const fallback = initial && !ts.isObjectLiteralExpression(initial) ? printDefault(initial, checker) : undefined;
    upsert(props, {
      name,
      type: value,
      ...(fallback !== undefined ? { default: fallback } : {}),
      ...(factory.required ? { required: true } : {}),
      description: doc.description,
      ...(factory.kind === "model" ? { binding: `[(${name})]` } : {}),
      ...(accepts ? { accepts } : {}),
      ...(doc.deprecated ? { deprecated: doc.deprecated } : {}),
    });
    if (factory.kind === "model") {
      upsert(changes, { name: `${name}Change`, payload: value, description: `The new \`${name}\`: the event half of \`[(${name})]\`.` });
    }
  }
  // An input `x` beside an output `xChange` binds two-way too: `[(x)]`.
  for (const prop of props) {
    if (!prop.binding && events.some((event) => event.name === `${prop.name}Change`)) prop.binding = `[(${prop.name})]`;
  }
  // A model's change event, unless the class declares that output itself.
  return { props, events: [...events, ...changes.filter((change) => !events.some((event) => event.name === change.name))] };
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** The `select` of each `<ng-content>` the template has (`*` for the default one). */
function projections(template: string): string[] {
  const found: string[] = [];
  class Visitor extends TmplAstRecursiveVisitor {
    override visitContent(content: TmplAstContent): void {
      found.push(content.selector);
      super.visitContent(content);
    }
  }
  tmplAstVisitAll(new Visitor(), parseTemplate(template, "template.html", {}).nodes);
  return [...new Set(found)];
}

function projectionNote(template: string | undefined): string | undefined {
  // Parsed only when it can project: most templates have no `<ng-content>`.
  if (!template?.includes("<ng-content")) return undefined;
  const selectors = projections(template);
  if (selectors.length === 0) return undefined;
  const named = selectors.filter((selector) => selector !== "*");
  const parts = [
    ...(selectors.includes("*") ? ["its content (`<ng-content>`)"] : []),
    ...named.map((selector) => `content matching \`${selector}\``),
  ];
  return `Projects ${parts.join(" and ")}.`;
}

/** The elements an attribute selector applies to: `button[pxlButton], a[pxlButton]` → `button`, `a`. */
function hostNote(selector: string): string | undefined {
  const parsed = CssSelector.parse(selector);
  const attributeForms = parsed.filter((s) => s.attrs.length > 0);
  if (attributeForms.length === 0) return undefined;
  // `pxl-glitch, span[pxlGlitch]`: an element of its own, or an attribute on a native one.
  const lead = attributeForms.length < parsed.length ? "As an attribute, it goes" : "Goes";
  const elements = [...new Set(attributeForms.map((s) => s.element))];
  if (elements.includes(null)) return `${lead} on any element, which keeps its own attributes and events.`;
  const tags = elements.map((element) => `\`<${element}>\``);
  const list = tags.length > 1 ? `${tags.slice(0, -1).join(", ")} or ${tags[tags.length - 1]}` : tags[0];
  return `${lead} on a native ${list}, which keeps its own attributes and events.`;
}

/** Whether the directive takes the template it sits on (a structural directive). */
function injectsTemplate(declaration: ts.ClassDeclaration): boolean {
  return declaration.members.some(
    (member) =>
      ts.isPropertyDeclaration(member) &&
      member.initializer !== undefined &&
      ts.isCallExpression(member.initializer) &&
      ts.isIdentifier(member.initializer.expression) &&
      member.initializer.expression.text === "inject" &&
      member.initializer.arguments.some((arg) => ts.isIdentifier(arg) && arg.text === "TemplateRef"),
  );
}

function structuralNote(selector: string): string {
  const attribute = CssSelector.parse(selector).flatMap((s) => s.attrs.filter((_, index) => index % 2 === 0))[0];
  return attribute
    ? `Structural: write it as \`*${attribute}\` on the content, or on an \`<ng-template>\`.`
    : "Structural: it takes the `<ng-template>` it is on.";
}

/** Form-control support: `ngModel`, `formControl`, `formControlName`, with the value type and the model it fills. */
function formsNote(api: ApiProgram, declaration: ts.ClassDeclaration, options: ts.ObjectLiteralExpression): string | undefined {
  const implementsAccessor = declaration.heritageClauses?.some(
    (clause) =>
      clause.token === ts.SyntaxKind.ImplementsKeyword &&
      clause.types.some((type) => nodeText(type.expression) === "ControlValueAccessor"),
  );
  const providers = option(options, "providers");
  const provides =
    providers !== undefined &&
    ts.isArrayLiteralExpression(providers) &&
    providers.elements.some((element) => /\bprovideValueAccessor\b|\bNG_VALUE_ACCESSOR\b/.test(nodeText(element)));
  if (!implementsAccessor && !provides) return undefined;
  let valueType: string | undefined;
  let target: string | undefined;
  for (const member of declaration.members) {
    if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) continue;
    if (member.name.text === "registerOnChange") {
      const fn = member.parameters[0]?.type;
      const value = fn && ts.isFunctionTypeNode(fn) ? fn.parameters[0]?.type : undefined;
      if (value) valueType = printTypeNode(value, api.checker);
    }
    if (member.name.text === "writeValue" && member.body) {
      const visit = (node: ts.Node): void => {
        // `this.checked.set(…)`: the model the form writes.
        if (
          !target &&
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === "set" &&
          ts.isPropertyAccessExpression(node.expression.expression) &&
          node.expression.expression.expression.kind === ts.SyntaxKind.ThisKeyword
        ) {
          target = node.expression.expression.name.text;
        }
        ts.forEachChild(node, visit);
      };
      visit(member.body);
    }
  }
  const value = valueType ? `\`${valueType}\`` : "its value";
  return `A form control: works with \`ngModel\`, \`formControl\` and \`formControlName\`${
    target ? `, which read and write \`${target}\` (${value})` : ` (${value})`
  }.`;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function classApi(api: ApiProgram, name: string, declaration: ts.ClassDeclaration): ApiComponent | undefined {
  const decorated = decoratorOf(declaration);
  if (!decorated) return undefined;
  const selector = stringValue(option(decorated.options, "selector"));
  const { props, events } = membersOf(api, declaration);
  const notes: string[] = [];
  if (selector) {
    if (decorated.kind === "Directive" && injectsTemplate(declaration)) notes.push(structuralNote(selector));
    else {
      const host = hostNote(selector);
      if (host) notes.push(host);
    }
  }
  const projection = projectionNote(stringValue(option(decorated.options, "template")));
  if (projection) notes.push(projection);
  const forms = formsNote(api, declaration, decorated.options);
  if (forms) notes.push(forms);
  const exportAs = stringValue(option(decorated.options, "exportAs"));
  if (exportAs) notes.push(`Exported as \`${exportAs}\`: \`#ref="${exportAs}"\` gives a template reference to it.`);
  return { name, ...(selector ? { selector } : {}), props, events, slots: [], notes };
}

/** Each documented component's Angular API: the component, then the parts exported beside it. */
export function angularApis(api: ApiProgram, names: readonly string[]): Map<string, ApiReference> {
  const out = new Map<string, ApiReference>();
  const entry = api.entries.angular;
  if (!entry) return out;
  const exports = moduleExports(api, entry);
  const documented = new Set(names);
  const parts = new Map<string, Array<{ name: string; declaration: ts.ClassDeclaration }>>();
  for (const [exportName, symbol] of exports) {
    if (documented.has(exportName)) continue;
    const owner = ownerOf(exportName, names);
    const declaration = owner ? classOf(api, symbol) : undefined;
    if (owner && declaration) parts.set(owner, [...(parts.get(owner) ?? []), { name: exportName, declaration }]);
  }
  for (const name of names) {
    const declaration = classOf(api, exports.get(name));
    const main = declaration ? classApi(api, name, declaration) : undefined;
    if (!main) continue;
    const components = [main];
    for (const part of parts.get(name) ?? []) {
      const component = classApi(api, part.name, part.declaration);
      if (component) components.push(component);
    }
    const imports = [name, ...(parts.get(name) ?? []).map((part) => part.name)];
    out.set(name, { import: `import { ${imports.join(", ")} } from '${KIT_PACKAGES.angular}';`, components });
  }
  return out;
}
