/**
 * The Vue kit's API: each component's props, events and slots, read from
 * its single-file component's macros — `defineProps` (with `withDefaults`),
 * `defineEmits`, `defineSlots`, `defineModel`, `defineOptions`,
 * `defineExpose` — or from the options a `defineComponent` passes (`props`,
 * `emits`, `slots`). Types resolve with the checker over the program of
 * api-program.ts; `update:x` events name the `v-model` bindings.
 */
import ts from "typescript";
import type { ElementNode, RootNode, TemplateChildNode } from "@vue/compiler-core";
import { KIT_PACKAGES, type ApiComponent, type ApiEvent, type ApiProp, type ApiReference, type ApiSlot } from "./api-model.js";
import { moduleExports, sfcFileOf, type ApiProgram, type SfcModule } from "./api-program.js";
import {
  docOf,
  docOfDeclaration,
  docText,
  nodeText,
  printDefault,
  printParameters,
  printSignature,
  printType,
  printTypeNode,
  propertyName,
} from "./api-print.js";
import { ownerOf } from "./api-react.js";

/** Where a Vue component is defined. */
type VueSource =
  | { kind: "sfc"; sfc: SfcModule; sourceFile: ts.SourceFile }
  | { kind: "define"; options: ts.ObjectLiteralExpression };

/** Strips casts and parentheses. */
function unwrap(node: ts.Expression): ts.Expression {
  let inner = node;
  while (ts.isAsExpression(inner) || ts.isSatisfiesExpression(inner) || ts.isParenthesizedExpression(inner)) {
    inner = inner.expression;
  }
  return inner;
}

/** The object literal an expression is, or names through a constant. */
function objectLiteral(api: ApiProgram, node: ts.Expression | undefined, depth = 0): ts.ObjectLiteralExpression | undefined {
  if (!node || depth > 4) return undefined;
  const inner = unwrap(node);
  if (ts.isObjectLiteralExpression(inner)) return inner;
  if (ts.isIdentifier(inner)) {
    let symbol = api.checker.getSymbolAtLocation(inner);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = api.checker.getAliasedSymbol(symbol);
    const declaration = symbol?.valueDeclaration;
    if (declaration && ts.isVariableDeclaration(declaration)) return objectLiteral(api, declaration.initializer, depth + 1);
  }
  return undefined;
}

function isCallTo(node: ts.Node, name: string): node is ts.CallExpression {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === name;
}

/** Where the component an export names is defined: through aliases, to its `.vue` file or `defineComponent` call. */
function sourceOf(api: ApiProgram, symbol: ts.Symbol | undefined, depth = 0): VueSource | undefined {
  if (!symbol || depth > 6) return undefined;
  const { checker } = api;
  if (symbol.flags & ts.SymbolFlags.Alias) return sourceOf(api, checker.getAliasedSymbol(symbol), depth + 1);
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return undefined;
  const sourceFile = declaration.getSourceFile();
  if (sfcFileOf(sourceFile.fileName)) {
    const sfc = api.sfcs.get(sourceFile.fileName);
    return sfc ? { kind: "sfc", sfc, sourceFile } : undefined;
  }
  const value = ts.isExportAssignment(declaration)
    ? declaration.expression
    : ts.isVariableDeclaration(declaration)
      ? declaration.initializer
      : undefined;
  if (!value) return undefined;
  const inner = unwrap(value);
  if (isCallTo(inner, "defineComponent")) {
    const options = objectLiteral(api, inner.arguments[0]);
    return options ? { kind: "define", options } : undefined;
  }
  if (ts.isIdentifier(inner)) return sourceOf(api, checker.getSymbolAtLocation(inner), depth + 1);
  return undefined;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Vue reads an absent prop whose type has `boolean` as `false`, unless it has a default (even `undefined`). */
function castsToFalse(type: ts.Type): boolean {
  const members = type.isUnion() ? type.types : [type];
  return members.some((member) => member.flags & ts.TypeFlags.BooleanLike);
}

/** `selectedIds` → `selected-ids`, as templates write attribute and event names. */
function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (c, index: number) => `${index ? "-" : ""}${c.toLowerCase()}`);
}

/** `onRowClick` → `@row-click`: Vue binds a listener to a prop named like one. */
function listenerBinding(name: string, type: string): string | undefined {
  const match = /^on([A-Z].*)$/.exec(name);
  return match && type.includes("=>") ? `@${kebab(match[1]!)}` : undefined;
}

/** `modelValue` binds with `v-model`, another prop with `v-model:its-name`. */
function modelBinding(name: string): string {
  return name === "modelValue" ? "v-model" : `v-model:${kebab(name)}`;
}

/**
 * A generic props interface's type parameters → the type arguments
 * `defineProps<PixelToggleGroupProps<T>>()` gives them.
 */
function typeArgumentsByParameter(checker: ts.TypeChecker, typeNode: ts.TypeNode): Map<ts.Symbol, ts.TypeNode> {
  const out = new Map<ts.Symbol, ts.TypeNode>();
  if (!ts.isTypeReferenceNode(typeNode) || !typeNode.typeArguments) return out;
  let symbol = checker.getSymbolAtLocation(typeNode.typeName);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  const declaration = symbol?.declarations?.find(
    (d): d is ts.InterfaceDeclaration | ts.TypeAliasDeclaration => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d),
  );
  declaration?.typeParameters?.forEach((parameter, index) => {
    const argument = typeNode.typeArguments![index];
    const parameterSymbol = checker.getSymbolAtLocation(parameter.name);
    if (argument && parameterSymbol) out.set(parameterSymbol, argument);
  });
  return out;
}

/** A member typed by a type parameter (`type?: T`) reads as the argument the props type gives it. */
function substituted(checker: ts.TypeChecker, node: ts.TypeNode, substitutions: Map<ts.Symbol, ts.TypeNode>): ts.TypeNode {
  if (!ts.isTypeReferenceNode(node) || node.typeArguments) return node;
  const symbol = checker.getSymbolAtLocation(node.typeName);
  return (symbol && substitutions.get(symbol)) ?? node;
}

/** Props from `defineProps<T>()`: T's properties, with `withDefaults` defaults. */
function typedProps(api: ApiProgram, typeNode: ts.TypeNode, defaults: ts.ObjectLiteralExpression | undefined): ApiProp[] {
  const { checker } = api;
  const defaultsByName = new Map<string, ts.Expression>();
  for (const property of defaults?.properties ?? []) {
    if (ts.isPropertyAssignment(property)) defaultsByName.set(propertyName(property.name), property.initializer);
  }
  const type = checker.getTypeFromTypeNode(typeNode);
  const substitutions = typeArgumentsByParameter(checker, typeNode);
  const out: ApiProp[] = [];
  for (const property of checker.getPropertiesOfType(type)) {
    const declaration = property.declarations?.[0];
    if (!declaration) continue;
    const doc = docOf(property, checker);
    if (doc.internal) continue;
    const optional = Boolean(property.flags & ts.SymbolFlags.Optional);
    const declared = (ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)) && declaration.type;
    const printed = declared
        ? printTypeNode(substituted(checker, declared, substitutions), checker, { optional })
        : ts.isMethodSignature(declaration)
          ? printSignature(declaration, checker)
          : printType(checker.getTypeOfSymbolAtLocation(property, typeNode), checker, { optional });
    const given = defaultsByName.get(property.name);
    const propertyType = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(property, typeNode));
    // Vue calls a default to make an object or an array, not a function.
    const factory = propertyType.getCallSignatures().length === 0;
    const fallback =
      given !== undefined
        ? printDefault(given, checker, { factory })
        : optional && castsToFalse(propertyType)
          ? "false"
          : doc.default;
    const binding = listenerBinding(property.name, printed);
    out.push({
      name: property.name,
      type: printed,
      ...(fallback !== undefined ? { default: fallback } : {}),
      ...(optional ? {} : { required: true }),
      description: doc.description,
      ...(binding ? { binding } : {}),
      ...(doc.deprecated ? { deprecated: doc.deprecated } : {}),
    });
  }
  return out;
}

const CONSTRUCTOR_TYPES: Readonly<Record<string, string>> = {
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Array: "unknown[]",
  Object: "object",
  Function: "Function",
  Date: "Date",
  Symbol: "symbol",
};

/** A runtime prop's `type` (`String as PropType<Surface>`, `[String, Number]`) as a type. */
function runtimeType(api: ApiProgram, node: ts.Expression | undefined): string {
  if (!node) return "unknown";
  if (ts.isAsExpression(node) && ts.isTypeReferenceNode(node.type) && node.type.typeArguments?.length === 1) {
    return printTypeNode(node.type.typeArguments[0]!, api.checker, { optional: true });
  }
  const inner = unwrap(node);
  if (ts.isArrayLiteralExpression(inner)) {
    return inner.elements.map((element) => runtimeType(api, element)).join(" | ");
  }
  if (ts.isIdentifier(inner)) return CONSTRUCTOR_TYPES[inner.text] ?? inner.text;
  return nodeText(inner);
}

/** Props from a runtime declaration (`props: { title: { type: String, default: undefined } }`). */
function runtimeProps(api: ApiProgram, declaration: ts.ObjectLiteralExpression): ApiProp[] {
  const { checker } = api;
  const out: ApiProp[] = [];
  for (const property of declaration.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;
    const name = propertyName(property.name);
    const doc = docOfDeclaration(property, checker);
    if (doc.internal) continue;
    const value = ts.isPropertyAssignment(property) ? unwrap(property.initializer) : undefined;
    const options = value && ts.isObjectLiteralExpression(value) ? value : undefined;
    const option = (key: string) =>
      options?.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && propertyName(p.name) === key)
        ?.initializer;
    const typeNode = options ? option("type") : value;
    const type = runtimeType(api, typeNode);
    const required = option("required")?.kind === ts.SyntaxKind.TrueKeyword;
    const given = option("default");
    const fallback =
      given !== undefined
        ? printDefault(given, checker, { factory: !type.includes("=>") && type !== "Function" })
        : !required && /\bboolean\b/.test(type)
          ? "false"
          : doc.default;
    const binding = listenerBinding(name, type);
    out.push({
      name,
      type,
      ...(fallback !== undefined ? { default: fallback } : {}),
      ...(required ? { required: true } : {}),
      description: doc.description,
      ...(binding ? { binding } : {}),
      ...(doc.deprecated ? { deprecated: doc.deprecated } : {}),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Events and slots
// ---------------------------------------------------------------------------

/** A tuple's members as a payload: `[checked: boolean]` → `checked: boolean`. */
function tuplePayload(api: ApiProgram, tuple: ts.TupleTypeNode): string {
  return tuple.elements
    .map((element) => {
      if (ts.isNamedTupleMember(element)) {
        return `${element.dotDotDotToken ? "..." : ""}${element.name.text}${element.questionToken ? "?" : ""}: ${printTypeNode(element.type, api.checker)}`;
      }
      return printTypeNode(element, api.checker);
    })
    .join(", ");
}

/** Events from `defineEmits<{ … }>()`: named tuples, or call signatures. */
function typedEvents(api: ApiProgram, typeNode: ts.TypeNode): ApiEvent[] {
  if (!ts.isTypeLiteralNode(typeNode)) return [];
  const { checker } = api;
  const out: ApiEvent[] = [];
  for (const member of typeNode.members) {
    const doc = docOfDeclaration(member, checker);
    if (ts.isPropertySignature(member) && member.type && ts.isTupleTypeNode(member.type)) {
      out.push(event(propertyName(member.name), tuplePayload(api, member.type), doc));
    } else if (ts.isCallSignatureDeclaration(member)) {
      const [first, ...rest] = member.parameters;
      const name = first?.type && ts.isLiteralTypeNode(first.type) && ts.isStringLiteral(first.type.literal) ? first.type.literal.text : undefined;
      if (name) out.push(event(name, printParameters(rest, checker), docOfSignature(member, checker)));
    }
  }
  return out;
}

/** A call signature's doc comment (signatures declare no symbol of their own). */
function docOfSignature(signature: ts.SignatureDeclaration, checker: ts.TypeChecker): ReturnType<typeof docOf> {
  const resolved = checker.getSignatureFromDeclaration(signature);
  return { description: docText(resolved?.getDocumentationComment(checker)), internal: false };
}

/** Events from runtime `emits`: `{ change: (value: string) => true }` or `['change']`. */
function runtimeEvents(api: ApiProgram, declaration: ts.Expression): ApiEvent[] {
  const { checker } = api;
  const inner = unwrap(declaration);
  if (ts.isArrayLiteralExpression(inner)) {
    return inner.elements
      .filter((element): element is ts.StringLiteral => ts.isStringLiteral(element))
      .map((element) => ({ name: element.text, payload: "", description: "" }));
  }
  const literal = objectLiteral(api, inner);
  const out: ApiEvent[] = [];
  for (const property of literal?.properties ?? []) {
    if (!ts.isPropertyAssignment(property) && !ts.isMethodDeclaration(property)) continue;
    const validator = ts.isMethodDeclaration(property) ? property : unwrap(property.initializer);
    const payload =
      ts.isArrowFunction(validator) || ts.isFunctionExpression(validator) || ts.isMethodDeclaration(validator)
        ? printParameters(validator.parameters, checker)
        : "";
    out.push(event(propertyName(property.name), payload, docOfDeclaration(property, checker)));
  }
  return out;
}

function event(name: string, payload: string, doc: ReturnType<typeof docOf>): ApiEvent {
  return {
    name,
    payload,
    description: doc.description,
    ...(doc.deprecated ? { deprecated: doc.deprecated } : {}),
  };
}

/** Slots from `defineSlots<{ … }>()` / `SlotsType<{ … }>`: each slot's props are its function's parameter. */
function typedSlots(api: ApiProgram, typeNode: ts.TypeNode): ApiSlot[] {
  if (!ts.isTypeLiteralNode(typeNode)) return [];
  const { checker } = api;
  const out: ApiSlot[] = [];
  for (const member of typeNode.members) {
    if (!member.name) continue;
    const signature = ts.isMethodSignature(member)
      ? member
      : ts.isPropertySignature(member) && member.type && ts.isFunctionTypeNode(member.type)
        ? member.type
        : undefined;
    const parameter = signature?.parameters[0];
    const doc = docOfDeclaration(member, checker);
    out.push({
      name: propertyName(member.name),
      props: parameter?.type ? printTypeNode(parameter.type, checker) : "",
      description: doc.description,
    });
  }
  return out;
}

/** `update:open` events make `open` a `v-model:open` binding (`modelValue` the plain `v-model`). */
function bindModels(props: ApiProp[], events: readonly ApiEvent[]): void {
  for (const event of events) {
    const match = /^update:(.+)$/.exec(event.name);
    if (!match) continue;
    const prop = props.find((candidate) => candidate.name === match[1]);
    if (prop) prop.binding = modelBinding(prop.name);
  }
}

// ---------------------------------------------------------------------------
// Attribute fallthrough
// ---------------------------------------------------------------------------

const ELEMENT = 1;
/** `ElementTypes.ELEMENT`: a native element, not a component, `<slot>` or `<template>`. */
const NATIVE_ELEMENT = 0;
const DIRECTIVE = 7;
const COMMENT = 3;
const TEXT = 2;

function isElement(node: TemplateChildNode): node is ElementNode {
  return node.type === ELEMENT;
}

/** The element a template binds `$attrs` to (`v-bind="$attrs"`). */
function attrsTarget(nodes: readonly TemplateChildNode[]): ElementNode | undefined {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    const binds = node.props.some(
      (prop) =>
        prop.type === DIRECTIVE &&
        prop.name === "bind" &&
        !prop.arg &&
        prop.exp !== undefined &&
        "content" in prop.exp &&
        prop.exp.content.trim() === "$attrs",
    );
    if (binds) return node;
    const inner = attrsTarget(node.children);
    if (inner) return inner;
  }
  return undefined;
}

/** The element's tag as the notes write it: `<button>`, or `<PixelBareButton>` for a component. */
function tagPhrase(node: ElementNode): string {
  return `\`<${node.tag}>\``;
}

/** Where attributes and listeners the component does not declare go. */
function fallthroughNote(sfc: SfcModule, inheritAttrs: boolean): string | undefined {
  const ast: RootNode | undefined = sfc.descriptor.template?.ast;
  if (!ast) return undefined;
  if (!inheritAttrs) {
    const target = attrsTarget(ast.children);
    return target ? `Other attributes and listeners go to the ${tagPhrase(target)}.` : undefined;
  }
  const roots = ast.children.filter(
    (node) => node.type !== COMMENT && !(node.type === TEXT && !node.content.trim()),
  );
  const root = roots.length === 1 ? roots[0] : undefined;
  // Only a native element: a component, `<slot>` or `<template>` root passes them on in its own way.
  if (!root || !isElement(root) || root.tagType !== NATIVE_ELEMENT) return undefined;
  // A `v-if` root renders one of several elements: no single one to name.
  if (root.props.some((prop) => prop.type === DIRECTIVE && (prop.name === "if" || prop.name === "for"))) return undefined;
  return `Other attributes and listeners fall through to its root ${tagPhrase(root)}.`;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** The macros a `<script setup>` calls. */
interface Macros {
  props?: ts.CallExpression;
  defaults?: ts.ObjectLiteralExpression;
  emits?: ts.CallExpression;
  slots?: ts.CallExpression;
  models: ts.CallExpression[];
  options?: ts.CallExpression;
  expose?: ts.CallExpression;
}

function macrosOf(sourceFile: ts.SourceFile): Macros {
  const macros: Macros = { models: [] };
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      switch (node.expression.text) {
        case "defineProps":
          macros.props = node;
          break;
        case "withDefaults": {
          const second = node.arguments[1];
          if (second && ts.isObjectLiteralExpression(unwrap(second))) macros.defaults = unwrap(second) as ts.ObjectLiteralExpression;
          break;
        }
        case "defineEmits":
          macros.emits = node;
          break;
        case "defineSlots":
          macros.slots = node;
          break;
        case "defineModel":
          macros.models.push(node);
          break;
        case "defineOptions":
          macros.options = node;
          break;
        case "defineExpose":
          macros.expose = node;
          break;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return macros;
}

/** `defineModel<T>('name', { default, required })`: a prop and its `update:` event. */
function modelMembers(api: ApiProgram, call: ts.CallExpression): { prop: ApiProp; event: ApiEvent } {
  const { checker } = api;
  const [first, second] = call.arguments;
  const name = first && ts.isStringLiteral(first) ? first.text : "modelValue";
  const options = objectLiteral(api, first && !ts.isStringLiteral(first) ? first : second);
  const option = (key: string) =>
    options?.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && propertyName(p.name) === key)
      ?.initializer;
  const required = option("required")?.kind === ts.SyntaxKind.TrueKeyword;
  const typeNode = call.typeArguments?.[0];
  const type = typeNode ? printTypeNode(typeNode, checker, { optional: !required }) : "unknown";
  const given = option("default");
  const fallback = given !== undefined ? printDefault(given, checker, { factory: !type.includes("=>") }) : undefined;
  const statement = ts.findAncestor(call, ts.isVariableStatement);
  const doc = statement ? docOfDeclaration(statement.declarationList.declarations[0]!, checker) : { description: "", internal: false };
  return {
    prop: {
      name,
      type,
      ...(fallback !== undefined ? { default: fallback } : {}),
      ...(required ? { required: true } : {}),
      description: doc.description,
      binding: modelBinding(name),
    },
    event: { name: `update:${name}`, payload: `value: ${type}`, description: "" },
  };
}

function sfcComponent(api: ApiProgram, name: string, sfc: SfcModule, sourceFile: ts.SourceFile): ApiComponent {
  const macros = macrosOf(sourceFile);
  const propsType = macros.props?.typeArguments?.[0];
  const runtimeDeclaration = macros.props && !propsType ? objectLiteral(api, macros.props.arguments[0]) : undefined;
  const props = propsType
    ? typedProps(api, propsType, macros.defaults)
    : runtimeDeclaration
      ? runtimeProps(api, runtimeDeclaration)
      : [];
  const emitsType = macros.emits?.typeArguments?.[0];
  const events = emitsType
    ? typedEvents(api, emitsType)
    : macros.emits?.arguments[0]
      ? runtimeEvents(api, macros.emits.arguments[0])
      : [];
  for (const call of macros.models) {
    const { prop, event } = modelMembers(api, call);
    props.push(prop);
    events.push(event);
  }
  bindModels(props, events);
  const slotsType = macros.slots?.typeArguments?.[0];
  const slots = slotsType ? typedSlots(api, slotsType) : [];

  const options = macros.options ? objectLiteral(api, macros.options.arguments[0]) : undefined;
  const inheritAttrs = !options?.properties.some(
    (p) => ts.isPropertyAssignment(p) && propertyName(p.name) === "inheritAttrs" && p.initializer.kind === ts.SyntaxKind.FalseKeyword,
  );
  const notes: string[] = [];
  const fallthrough = fallthroughNote(sfc, inheritAttrs);
  if (fallthrough) notes.push(fallthrough);
  const exposed = macros.expose ? objectLiteral(api, macros.expose.arguments[0]) : undefined;
  for (const property of exposed?.properties ?? []) {
    if (!property.name) continue;
    const doc = docOfDeclaration(property, api.checker);
    notes.push(`Its template ref exposes \`${propertyName(property.name)}\`${doc.description ? `: ${lowerFirst(doc.description)}` : "."}`);
  }
  return { name, props, events, slots, notes };
}

function lowerFirst(text: string): string {
  return /^[A-Z][a-z]/.test(text) ? `${text[0]!.toLowerCase()}${text.slice(1)}` : text;
}

function definedComponent(api: ApiProgram, name: string, options: ts.ObjectLiteralExpression): ApiComponent {
  const option = (key: string) =>
    options.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && propertyName(p.name) === key)
      ?.initializer;
  const propsDeclaration = objectLiteral(api, option("props"));
  const props = propsDeclaration ? runtimeProps(api, propsDeclaration) : [];
  const emits = option("emits");
  const events = emits ? runtimeEvents(api, emits) : [];
  bindModels(props, events);
  const slotsOption = option("slots");
  const slotsType =
    slotsOption && ts.isAsExpression(slotsOption) && ts.isTypeReferenceNode(slotsOption.type)
      ? slotsOption.type.typeArguments?.[0]
      : undefined;
  const slots = slotsType ? typedSlots(api, slotsType) : [];
  return { name, props, events, slots, notes: [] };
}

function componentApi(api: ApiProgram, name: string, symbol: ts.Symbol): ApiComponent | undefined {
  const source = sourceOf(api, symbol);
  if (!source) return undefined;
  return source.kind === "sfc"
    ? sfcComponent(api, name, source.sfc, source.sourceFile)
    : definedComponent(api, name, source.options);
}

/** Each documented component's Vue API: the component, then the parts exported beside it. */
export function vueApis(api: ApiProgram, names: readonly string[]): Map<string, ApiReference> {
  const out = new Map<string, ApiReference>();
  const entry = api.entries.vue;
  if (!entry) return out;
  const exports = moduleExports(api, entry);
  const documented = new Set(names);
  const parts = new Map<string, string[]>();
  for (const [exportName, symbol] of exports) {
    if (documented.has(exportName) || !(symbol.flags & ts.SymbolFlags.Value) || !/^Pixel|^PxlKit/.test(exportName)) continue;
    const owner = ownerOf(exportName, names);
    if (owner && sourceOf(api, symbol)) parts.set(owner, [...(parts.get(owner) ?? []), exportName]);
  }
  for (const name of names) {
    const symbol = exports.get(name);
    const main = symbol ? componentApi(api, name, symbol) : undefined;
    if (!main) continue;
    const components = [main];
    const partNames = parts.get(name) ?? [];
    for (const part of partNames) {
      const component = componentApi(api, part, exports.get(part)!);
      if (component) components.push(component);
    }
    out.set(name, {
      import: `import { ${[name, ...partNames].join(", ")} } from '${KIT_PACKAGES.vue}';`,
      components,
    });
  }
  return out;
}
