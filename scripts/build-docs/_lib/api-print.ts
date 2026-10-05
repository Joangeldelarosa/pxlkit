/**
 * Types, defaults and doc comments as the API reference prints them: as a
 * reader would write them. A type keeps the names its source gives it
 * (`React.ReactNode`, `PixelTableColumn<Row>[]`), except where the kits name
 * values a reader passes: an alias of literals, a token object's keys
 * (`keyof typeof stackGap`), what `Exclude` leaves, or a short union, spelled
 * out in the alias's own order (`Size` reads `'sm' | 'md' | 'lg'`).
 */
import ts from "typescript";

const printer = ts.createPrinter({ removeComments: true, omitTrailingSemicolon: true });

/** Source text of a node on one line, without comments. */
export function nodeText(node: ts.Node): string {
  const sourceFile = node.getSourceFile();
  const printed = node.pos >= 0 ? printer.printNode(ts.EmitHint.Unspecified, node, sourceFile) : node.getText();
  return oneLine(printed);
}

/** Collapses whitespace, and the separator a printed type literal ends with. */
export function oneLine(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/;\s*}/g, " }")
    .replace(/\{\s+}/g, "{}")
    .replace(/\[\s+/g, "[")
    .replace(/\s+\]/g, "]")
    .trim();
}

/**
 * Types joined in a union, a function or intersection type among them
 * grouped: `((next: number) => void) | ((next: string) => void)`.
 */
export function unionOf(types: readonly string[]): string {
  const members = [...new Set(types)];
  return members.length > 1 ? members.map((member) => (needsGrouping(member) ? `(${member})` : member)).join(" | ") : members.join("");
}

/** Whether a type has `=>` or `&` outside any brackets (it would bind wrongly in a union). */
function needsGrouping(type: string): boolean {
  let depth = 0;
  let quote: string | undefined;
  for (let index = 0; index < type.length; index++) {
    const char = type[index]!;
    if (quote) {
      if (char === "\\") index++;
      else if (char === quote) quote = undefined;
    } else if (char === "'" || char === '"' || char === "`") quote = char;
    else if ("([{<".includes(char)) depth++;
    else if (")]}>".includes(char) && type[index - 1] !== "=") depth--;
    else if (depth === 0 && (char === "&" || (char === "=" && type[index + 1] === ">"))) return true;
  }
  return false;
}

/** A literal (`'md'`, `8`, `true`) or a primitive (`number`): what an alias may be spelled out to. */
function isSimpleMember(member: string): boolean {
  return (
    /^'(?:[^'\\]|\\.)*'$/.test(member) ||
    /^-?\d[\d_.e+-]*n?$/i.test(member) ||
    ["true", "false", "null", "undefined", "string", "number", "boolean", "bigint"].includes(member)
  );
}

function stringLiteral(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/** The type alias a type name refers to, through imports. */
function aliasDeclaration(name: ts.EntityName, checker: ts.TypeChecker): ts.TypeAliasDeclaration | undefined {
  let symbol = checker.getSymbolAtLocation(name);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return symbol?.declarations?.find(ts.isTypeAliasDeclaration);
}

/**
 * The keys of a token object (`keyof typeof stackGap`), in its own order,
 * when the kit declares it: numeric keys read as numbers, like `keyof` does.
 */
function tokenKeys(node: ts.TypeOperatorNode, checker: ts.TypeChecker): string[] | undefined {
  if (node.operator !== ts.SyntaxKind.KeyOfKeyword || !ts.isTypeQueryNode(node.type)) return undefined;
  let symbol = checker.getSymbolAtLocation(node.type.exprName);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  const declaration = symbol?.valueDeclaration;
  if (!declaration || !ts.isVariableDeclaration(declaration) || !isOwnSource(declaration)) return undefined;
  const keys = checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(symbol!, declaration)).map((key) => key.name);
  return keys.map((key) => (/^\d+$/.test(key) ? key : stringLiteral(key)));
}

/** Whether a type node mentions a type parameter (its resolution would be generic). */
function containsTypeParameter(node: ts.Node, checker: ts.TypeChecker): boolean {
  if (ts.isTypeReferenceNode(node)) {
    const symbol = checker.getSymbolAtLocation(node.typeName);
    if (symbol && symbol.flags & ts.SymbolFlags.TypeParameter) return true;
  }
  return ts.forEachChild(node, (child) => containsTypeParameter(child, checker) || undefined) ?? false;
}

/** Declared in a workspace package, not a dependency. */
function isOwnSource(node: ts.Node): boolean {
  return !node.getSourceFile().fileName.includes("/node_modules/");
}

/** A declared type's union members, literal aliases spelled out. */
function unionMembers(node: ts.TypeNode, checker: ts.TypeChecker, seen: ReadonlySet<ts.Node>): string[] {
  if (ts.isUnionTypeNode(node)) return node.types.flatMap((member) => unionMembers(member, checker, seen));
  // Parentheses around a union only group it; around a function type they are needed.
  if (ts.isParenthesizedTypeNode(node) && ts.isUnionTypeNode(node.type)) return unionMembers(node.type, checker, seen);
  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (ts.isStringLiteral(literal) || ts.isNoSubstitutionTemplateLiteral(literal)) return [stringLiteral(literal.text)];
    return [nodeText(node)];
  }
  if (node.kind === ts.SyntaxKind.UndefinedKeyword) return ["undefined"];
  if (ts.isTypeOperatorNode(node)) {
    const keys = tokenKeys(node, checker);
    if (keys) return keys;
  }
  // `React.AnchorHTMLAttributes<HTMLAnchorElement>['target']` reads as what it is.
  if (ts.isIndexedAccessTypeNode(node) && !containsTypeParameter(node, checker)) {
    return typeMembers(checker.getTypeFromTypeNode(node), checker);
  }
  // `${Lines}` reads as the strings it stands for, in the alias's order: `'2' | '3' | '4'`.
  if (ts.isTemplateLiteralTypeNode(node)) {
    const span = node.templateSpans[0];
    if (node.head.text === "" && node.templateSpans.length === 1 && span && span.literal.text === "") {
      const members = unionMembers(span.type, checker, seen);
      if (members.every((member) => /^'/.test(member) || /^-?\d/.test(member))) {
        return members.map((member) => (member.startsWith("'") ? member : stringLiteral(member)));
      }
    }
    const members = typeMembers(checker.getTypeFromTypeNode(node), checker);
    if (members.every(isSimpleMember)) return members;
  }
  // `Exclude<StackAlign, 'baseline'>` reads as what is left, in the alias's order.
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    (node.typeName.text === "Exclude" || node.typeName.text === "Extract") &&
    node.typeArguments?.length === 2
  ) {
    const from = unionMembers(node.typeArguments[0]!, checker, seen);
    const by = new Set(unionMembers(node.typeArguments[1]!, checker, seen));
    if (from.every(isSimpleMember) && [...by].every(isSimpleMember)) {
      return from.filter((member) => (node.typeName as ts.Identifier).text === "Exclude" ? !by.has(member) : by.has(member));
    }
  }
  if (ts.isTypeReferenceNode(node) && !node.typeArguments) {
    const alias = aliasDeclaration(node.typeName, checker);
    if (alias && !seen.has(alias) && isOwnSource(alias)) {
      if (!alias.typeParameters) {
        const members = unionMembers(alias.type, checker, new Set([...seen, alias]));
        // An alias of an alias reads as far as the inner one spells out.
        const spelledOut = ts.isUnionTypeNode(alias.type) || members.length !== 1 || members[0] !== nodeText(alias.type);
        if (members.every(isSimpleMember) || (spelledOut && isShortUnion(members))) return members;
      } else if (alias.typeParameters.every((parameter) => parameter.default) && ts.isUnionTypeNode(alias.type)) {
        // A generic alias used with its defaults (`PxlContent`): what it resolves to.
        const members = joinUnion(typeMembers(checker.getTypeFromTypeNode(node), checker, { throughAlias: true })).split(" | ");
        if (isShortUnion(members)) return members;
      }
    }
  }
  return [nodeText(node)];
}

/** A union short enough to read inline in place of its alias. */
function isShortUnion(members: readonly string[]): boolean {
  return members.length <= 4 && members.join(" | ").length <= 60;
}

/**
 * Joins union members: duplicates dropped, `true | false` read as
 * `boolean`, and `undefined` dropped from an optional member's type, where
 * it only says the member may be left out.
 */
export function joinUnion(members: readonly string[], { optional = false }: { optional?: boolean } = {}): string {
  const out: string[] = [];
  for (const member of members) if (!out.includes(member)) out.push(member);
  if (out.includes("true") && out.includes("false")) {
    out.splice(out.indexOf("true"), 1, "boolean");
    out.splice(out.indexOf("false"), 1);
  }
  const kept = optional && out.length > 1 ? out.filter((member) => member !== "undefined") : out;
  return kept.join(" | ");
}

/** A declared type, as a reader writes it. */
export function printTypeNode(node: ts.TypeNode, checker: ts.TypeChecker, options: { optional?: boolean } = {}): string {
  return joinUnion(unionMembers(node, checker, new Set()), options);
}

/**
 * A type's union members as the checker names them: literals single-quoted,
 * an aliased union kept whole unless `throughAlias`.
 */
function typeMembers(type: ts.Type, checker: ts.TypeChecker, { throughAlias = false } = {}): string[] {
  const members = type.isUnion() && (throughAlias || !type.aliasSymbol) ? type.types : [type];
  return members.map((member) => {
    if (member.isStringLiteral()) return stringLiteral(member.value);
    const text = oneLine(
      checker.typeToString(
        member,
        undefined,
        ts.TypeFormatFlags.NoTruncation |
          ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
          ts.TypeFormatFlags.WriteArrowStyleSignature,
      ),
    );
    // In a union, an intersection or a function type reads grouped: `'_top' | (string & {})`.
    const grouped = members.length > 1 && (member.isIntersection() || (member.getCallSignatures().length > 0 && !member.getProperties().length));
    return grouped ? `(${text})` : text;
  });
}

/** A type the checker inferred (no declared type to print), as a reader writes it. */
export function printType(type: ts.Type, checker: ts.TypeChecker, options: { optional?: boolean } = {}): string {
  return joinUnion(typeMembers(type, checker), options);
}

/** A function type's parameters as source: `value: string, index: number`. */
export function printParameters(parameters: readonly ts.ParameterDeclaration[], checker: ts.TypeChecker): string {
  return parameters
    .map((parameter) => {
      const name = nodeText(parameter.name);
      const rest = parameter.dotDotDotToken ? "..." : "";
      const optional = parameter.questionToken ? "?" : "";
      if (!parameter.type) return `${rest}${name}${optional}`;
      return `${rest}${name}${optional}: ${printTypeNode(parameter.type, checker)}`;
    })
    .join(", ");
}

/** A method signature (`onChange(value: string): void`) as a function type. */
export function printSignature(signature: ts.SignatureDeclarationBase, checker: ts.TypeChecker): string {
  const returns = signature.type ? printTypeNode(signature.type, checker) : "void";
  return `(${printParameters(signature.parameters, checker)}) => ${returns}`;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/**
 * A default value as source. A constant it names reads as its literal value
 * (`size = DEFAULT_SIZE` → `'md'`); with `factory` (Vue's defaults of
 * objects and arrays), a function reads as what it makes (`() => []` → `[]`).
 */
export function printDefault(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  { factory = false }: { factory?: boolean } = {},
): string | undefined {
  let node: ts.Expression = expression;
  while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
    node = node.expression;
  }
  if (node.kind === ts.SyntaxKind.UndefinedKeyword || (ts.isIdentifier(node) && node.text === "undefined")) return undefined;
  if (factory && ts.isArrowFunction(node) && !ts.isBlock(node.body)) return printDefault(node.body, checker);
  if (ts.isIdentifier(node)) {
    let symbol = checker.getSymbolAtLocation(node);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    const declaration = symbol?.valueDeclaration;
    if (
      declaration &&
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const &&
      isLiteralExpression(declaration.initializer)
    ) {
      return printDefault(declaration.initializer, checker);
    }
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return stringLiteral(node.text);
  return nodeText(node);
}

function isLiteralExpression(node: ts.Expression): boolean {
  let inner = node;
  while (ts.isAsExpression(inner) || ts.isParenthesizedExpression(inner)) inner = inner.expression;
  return (
    ts.isStringLiteral(inner) ||
    ts.isNoSubstitutionTemplateLiteral(inner) ||
    ts.isNumericLiteral(inner) ||
    (ts.isPrefixUnaryExpression(inner) && ts.isNumericLiteral(inner.operand)) ||
    inner.kind === ts.SyntaxKind.TrueKeyword ||
    inner.kind === ts.SyntaxKind.FalseKeyword ||
    inner.kind === ts.SyntaxKind.NullKeyword
  );
}

// ---------------------------------------------------------------------------
// Doc comments
// ---------------------------------------------------------------------------

export interface DocComment {
  /** The comment's text on one line, markdown code spans kept. */
  description: string;
  deprecated?: string;
  /** The `@default` tag, as written. */
  default?: string;
  /** Tagged `@internal`: not part of the public API. */
  internal: boolean;
}

/** Doc comment parts as text: `{@link Name}` reads `` `Name` ``, `{@link Name | label}` its label. */
export function docText(parts: readonly ts.SymbolDisplayPart[] | undefined): string {
  if (!parts) return "";
  let out = "";
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index]!;
    if (part.kind === "link") {
      // {@link …}: `link` "{@link ", `linkName`, optional `linkText`, `link` "}".
      let name = "";
      let label = "";
      for (index++; index < parts.length && parts[index]!.kind !== "link"; index++) {
        const inner = parts[index]!;
        if (inner.kind === "linkName") name += inner.text;
        else label += inner.text;
      }
      label = label.trim();
      out += label || (name ? `\`${name.trim()}\`` : "");
      continue;
    }
    out += part.text;
  }
  return oneLine(out);
}

/** A symbol's doc comment. */
export function docOf(symbol: ts.Symbol | undefined, checker: ts.TypeChecker): DocComment {
  if (!symbol) return { description: "", internal: false };
  const tags = symbol.getJsDocTags(checker);
  const tag = (name: string) => tags.find((t) => t.name === name);
  const deprecated = tag("deprecated");
  const fallback = tag("default") ?? tag("defaultValue");
  return {
    description: docText(symbol.getDocumentationComment(checker)),
    ...(deprecated ? { deprecated: docText(deprecated.text) || "Deprecated." } : {}),
    ...(fallback ? { default: docText(fallback.text) } : {}),
    internal: Boolean(tag("internal")),
  };
}

/** The doc comment of a declaration (through the symbol its name declares). */
export function docOfDeclaration(declaration: ts.NamedDeclaration, checker: ts.TypeChecker): DocComment {
  const name = declaration.name;
  return docOf(name ? checker.getSymbolAtLocation(name) : undefined, checker);
}

/** A property name as the reader writes it (`'update:open'` reads `update:open`). */
export function propertyName(name: ts.PropertyName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isPrivateIdentifier(name)) {
    return name.text;
  }
  return nodeText(name);
}
