/**
 * The API part of a generated /docs section: the component's API in each
 * framework (extract-api.ts) as data, handed to the site's `FrameworkApi`
 * (apps/web/src/components/FrameworkApi.tsx), which draws it under the same
 * React / Vue / Angular tabs as the section's code. React's tab is the one
 * the server renders.
 */
import { API_FRAMEWORKS, type ApiComponent, type ApiReference, type ComponentApi } from "./api-model.js";

/** Where the site's component lives, as the sections import it. */
export const FRAMEWORK_API_MODULE = "@/components/FrameworkApi";

/** Whether the section has an API to show: React's, at least. */
export function hasApi(api: ComponentApi | undefined): api is ComponentApi & { react: ApiReference } {
  return api?.react !== undefined;
}

/** U+2028 and U+2029 end a line in older JS parsers: escaped in string literals. */
const LINE_SEPARATORS = new RegExp(`[${String.fromCharCode(0x2028, 0x2029)}]`, "g");

/** A JS string literal, quoted to need the fewest escapes. */
function quote(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(LINE_SEPARATORS, (separator) => `\\u${separator.charCodeAt(0).toString(16)}`);
  if (escaped.includes("'") && !escaped.includes('"')) return `"${escaped}"`;
  return `'${escaped.replace(/'/g, "\\'")}'`;
}

function isPlain(value: unknown): boolean {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

/**
 * A value as a JS literal: objects of plain values on one line, the rest
 * one entry per line; empty strings, empty lists and `false` left out.
 */
function literal(value: unknown, indent: string): string {
  if (typeof value === "string") return quote(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return String(value);
  const inner = `${indent}  `;
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((item) => `${inner}${literal(item, inner)},`).join("\n")}\n${indent}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0),
  );
  const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k));
  if (entries.every(([, v]) => isPlain(v))) {
    return `{ ${entries.map(([k, v]) => `${key(k)}: ${literal(v, inner)}`).join(", ")} }`;
  }
  return `{\n${entries.map(([k, v]) => `${inner}${key(k)}: ${literal(v, inner)},`).join("\n")}\n${indent}}`;
}

/** A component as the site's `ApiComponent`: its fields in a fixed order. */
function componentData(component: ApiComponent): Record<string, unknown> {
  return {
    name: component.name,
    selector: component.selector,
    props: component.props.map((prop) => ({
      name: prop.name,
      type: prop.type,
      default: prop.default,
      required: prop.required,
      binding: prop.binding,
      accepts: prop.accepts,
      description: prop.description,
      deprecated: prop.deprecated,
    })),
    events: component.events.map((event) => ({
      name: event.name,
      payload: event.payload,
      description: event.description,
      deprecated: event.deprecated,
    })),
    slots: component.slots.map((slot) => ({ name: slot.name, props: slot.props, description: slot.description })),
    notes: component.notes,
  };
}

/** The module-level constant a section declares its API in. */
export function renderApiConstant(name: string, api: ComponentApi): string {
  const data: Record<string, unknown> = {};
  for (const framework of API_FRAMEWORKS) {
    const reference = api[framework];
    if (reference) data[framework] = { import: reference.import, components: reference.components.map(componentData) };
  }
  return [
    `/** ${name}'s API in each kit, read from its sources by \`npm run docs:build\`. */`,
    `const api: FrameworkApiReferences = ${literal(data, "")};`,
  ].join("\n");
}

/** The section's API block: a heading, then the tabs. */
export function renderApiBlock(name: string, slug: string, api: ComponentApi): string {
  const frameworks = API_FRAMEWORKS.filter((framework) => api[framework]).map((framework) => `${framework}={api.${framework}}`);
  return [
    `    <section aria-labelledby="${slug}-api">`,
    `      <h3 id="${slug}-api">API</h3>`,
    `      <FrameworkApi label={${quote(`${name} API`)}} ${frameworks.join(" ")} />`,
    `    </section>`,
  ].join("\n");
}
