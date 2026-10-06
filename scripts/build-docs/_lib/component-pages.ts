/**
 * Each component's own page on the site (/docs/components/<slug>): the data
 * the page and the sitemap read, written by generate-docs-page.ts beside the
 * sections it renders.
 *
 *   - component-pages.generated.ts     slug, name, category, the page's
 *                                      title and meta description, its
 *                                      neighbours in /docs's order
 *   - component-sections.generated.ts  each section, loaded on demand
 *
 * Titles and descriptions come from the manifest: the component's name, what
 * it is (its name's words: `PixelDateRangePicker` is a date range picker) and
 * its lead (the manifest's description), React first. A title fits 60
 * characters once the site appends " | Pxlkit"; a description fits 155.
 */
import { jsLiteral } from "./api-section.js";

/** /docs's categories, in its order, as its headings name them. */
export const COMPONENT_CATEGORIES: ReadonlyArray<{ id: string; label: string }> = [
  { id: "actions", label: "Actions" },
  { id: "forms", label: "Forms" },
  { id: "data", label: "Data Display" },
  { id: "cards", label: "Cards" },
  { id: "hero", label: "Hero" },
  { id: "feedback", label: "Feedback" },
  { id: "navigation", label: "Navigation" },
  { id: "overlays", label: "Overlays" },
  { id: "overlay-foundation", label: "Overlay Foundation" },
  { id: "layout", label: "Layout" },
  { id: "animations", label: "Animations" },
  { id: "parallax", label: "Parallax" },
];

/** The brand the page's title ends with, as the site's title template writes it (apps/web/src/app/layout.tsx). */
export const TITLE_SUFFIX = " | Pxlkit";
/** The longest title search results show whole, suffix included. */
export const TITLE_MAX = 60;
/** The longest meta description search results show whole. */
export const DESCRIPTION_MAX = 155;
/** The modules the docs build writes beside the sections, for the pages. */
export const COMPONENT_PAGES_FILE = "component-pages.generated.ts";
export const COMPONENT_SECTIONS_FILE = "component-sections.generated.ts";

/** Where a component's page lives, as the site's route has it (apps/web/src/app/docs/components/paths.ts). */
export const COMPONENT_PAGE_PREFIX = "/docs/components/";

/** The fields of a docs plan entry a page needs. */
export interface ComponentPageSource {
  name: string;
  slug: string;
  category: string;
  status: string;
  /** The manifest's description: the section's lead. */
  description: string;
}

export interface ComponentPageLink {
  slug: string;
  name: string;
}

export interface ComponentPage extends ComponentPageLink {
  category: string;
  categoryLabel: string;
  status: string;
  title: string;
  description: string;
  keywords: string[];
  previous?: ComponentPageLink;
  next?: ComponentPageLink;
}

/** What a component is, from its name: `PixelOTPInput` → `OTP Input`, `PxlKitToastProvider` → `Toast Provider`. */
export function componentNoun(name: string): string {
  const words = name.replace(/^(Pixel|PxlKit)(?=[A-Z])/, "").match(/[A-Z]+(?![a-z])|[A-Z][a-z0-9]*|[a-z0-9]+/g);
  return words ? words.join(" ") : name;
}

/** The page title, before the site's suffix: the longest form that fits. */
export function componentPageTitle(source: Pick<ComponentPageSource, "name" | "status">): string {
  const { name } = source;
  const noun = componentNoun(name);
  const forms =
    source.status === "deprecated"
      ? [`${name} — Deprecated React ${noun}`, `${name} (Deprecated)`]
      : [`${name} — React ${noun} Component`, `${name} — React ${noun}`, `${name} for React`];
  return forms.find((form) => `${form}${TITLE_SUFFIX}`.length <= TITLE_MAX) ?? forms[forms.length - 1]!;
}

/** Where `separator` occurs in `text` outside parentheses. */
function topLevelIndexes(text: string, separator: string): number[] {
  const out: number[] = [];
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(") depth++;
    else if (char === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && text.startsWith(separator, i)) out.push(i);
  }
  return out;
}

/** Words a shortened lead must not end on. */
const DANGLING = /\b(and|or|with|for|the|a|an|to|of|in|on|by|as|via|plus|from|into|per|its|their)$/i;

/** Words after a comma that start a new phrase, not a list's next item (`, optionally clickable`). */
const PHRASE_START = /^([a-z]+ly|with|each|which|then|so|while|ideal|perfect|usable|available|announces|renders|surfaces|paired)\b/;

/** Words that start what qualifies the thing a lead names: cutting before one keeps that thing whole. */
const QUALIFIERS = [
  " with ",
  " that ",
  " which ",
  " for ",
  " built ",
  " used ",
  " based on ",
  " within ",
  " while ",
  " when ",
  " via ",
  " in ",
  " surfacing ",
  " pairing ",
  " representing ",
];

/** The cuts of one lead (see `shorterLeads`). */
function cutsOf(lead: string): string[] {
  const out: string[] = [];
  for (const separator of [" — ", " – ", ". ", "; ", ": ", " ("]) {
    const [at] = topLevelIndexes(lead, separator);
    if (at !== undefined) out.push(lead.slice(0, at));
  }
  const [withAt] = topLevelIndexes(lead, " with ");
  if (withAt !== undefined) {
    const start = withAt + " with ".length;
    const commas = topLevelIndexes(lead, ", ").filter((at) => at > start);
    // A list right after "with" (`with tone, size, variant`), not a phrase holding one (`with cells for feature, stat`).
    const first = commas.length > 0 ? lead.slice(start, commas[0]) : "";
    if (commas.length > 0 && !/\b(for|in|to|that|which|of|from)\b/.test(first)) {
      for (const cut of commas) {
        const items = lead
          .slice(start, cut)
          .split(", ")
          .map((item) => item.replace(/^and /, ""));
        const list = items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0];
        out.push(`${lead.slice(0, start)}${list}`);
      }
    } else if (commas.length === 0) {
      // `with optional selection and surface-aware styling` → `with optional selection`.
      const [andAt] = topLevelIndexes(lead.slice(start), " and ");
      if (andAt !== undefined) out.push(lead.slice(0, start + andAt));
    }
  }
  for (const qualifier of QUALIFIERS) {
    for (const at of topLevelIndexes(lead, qualifier)) out.push(lead.slice(0, at));
  }
  // Before an adverb that qualifies what comes before it (`its children proportionally to scroll`).
  for (const match of lead.matchAll(/ [a-z]+ly /g)) {
    if (lead.slice(0, match.index).includes(" ")) out.push(lead.slice(0, match.index));
  }
  for (const at of topLevelIndexes(lead, ", ")) {
    if (PHRASE_START.test(lead.slice(at + 2))) out.push(lead.slice(0, at));
  }
  return out;
}

/**
 * Shorter forms of a lead, each ending on a whole phrase: before a dash, the
 * end of its first sentence, a semicolon or a parenthesis; its "with" list
 * cut after its first items (`with tone, size and variant`); before a word
 * that starts a qualifier (`with`, `that`, `for`, `surfacing`) or an adverb;
 * before a comma that ends a phrase — of the lead, and of the lead without
 * its parentheses.
 */
export function shorterLeads(lead: string): string[] {
  const plain = lead.replace(/ \([^()]*\)/g, "");
  const forms = plain === lead ? cutsOf(lead) : [...cutsOf(lead), plain, ...cutsOf(plain)];
  const balanced = (text: string) => (text.match(/\(/g)?.length ?? 0) === (text.match(/\)/g)?.length ?? 0);
  // `…, ideal` ends on an item of nothing.
  const endsOnFragment = (text: string) => {
    const commas = topLevelIndexes(text, ", ");
    return commas.length > 0 && !text.slice(commas[commas.length - 1]! + 2).includes(" ");
  };
  return [...new Set(forms.map((form) => form.trim().replace(/[,;:]$/, "")))].filter(
    (form) => form.length >= 12 && !DANGLING.test(form) && balanced(form) && !endsOnFragment(form),
  );
}

/** The lead's first word in lower case, after "for React:", unless it names something (`Embla-powered`, `SSR-safe`). */
function continueSentence(lead: string): string {
  const first = lead.split(/[\s,]/, 1)[0] ?? "";
  return /^[A-Z][a-z]+(?:[-/][a-z]+)*$/.test(first) && !/^(Embla|TanStack|React|Vue|Angular)\b/.test(first)
    ? `${lead[0]!.toLowerCase()}${lead.slice(1)}`
    : lead;
}

const DESCRIPTION_TAIL = ". Props, examples and accessibility — in Vue and Angular too.";

/**
 * The meta description: `<Name> for React: <lead>. Props, examples and
 * accessibility — in Vue and Angular too.`, the lead shortened to a whole
 * phrase when the whole does not fit.
 */
export function componentPageDescription(source: Pick<ComponentPageSource, "name" | "description">): string {
  const prefix = `${source.name} for React: `;
  const budget = DESCRIPTION_MAX - prefix.length - DESCRIPTION_TAIL.length;
  const lead = source.description.replace(/`/g, "").replace(/\s+/g, " ").trim().replace(/\.$/, "");
  const fitting =
    lead.length <= budget
      ? lead
      : shorterLeads(lead)
          .filter((form) => form.length <= budget)
          .sort((a, b) => b.length - a.length)[0];
  return `${prefix}${continueSentence(fitting ?? `${componentNoun(source.name).toLowerCase()} component`)}${DESCRIPTION_TAIL}`;
}

/** Search terms for the page: the name, then what it is in each framework, React first. */
export function componentPageKeywords(name: string): string[] {
  const noun = componentNoun(name).toLowerCase();
  return [name.toLowerCase(), `react ${noun} component`, `pxlkit ${noun}`, `vue ${noun} component`, `angular ${noun} component`];
}

const categoryRank = (category: string) => {
  const rank = COMPONENT_CATEGORIES.findIndex((entry) => entry.id === category);
  return rank < 0 ? COMPONENT_CATEGORIES.length : rank;
};

/** Every component's page, in /docs's order (by category, then slug), each linked to its category's previous and next. */
export function componentPages(sources: readonly ComponentPageSource[]): ComponentPage[] {
  const ordered = [...sources].sort(
    (a, b) => categoryRank(a.category) - categoryRank(b.category) || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0),
  );
  return ordered.map((source, index) => {
    const before = ordered[index - 1];
    const after = ordered[index + 1];
    return {
      slug: source.slug,
      name: source.name,
      category: source.category,
      categoryLabel: COMPONENT_CATEGORIES.find((entry) => entry.id === source.category)?.label ?? source.category,
      status: source.status,
      title: componentPageTitle(source),
      description: componentPageDescription(source),
      keywords: componentPageKeywords(source.name),
      ...(before && before.category === source.category ? { previous: { slug: before.slug, name: before.name } } : {}),
      ...(after && after.category === source.category ? { next: { slug: after.slug, name: after.name } } : {}),
    };
  });
}

const BANNER = `// AUTO-GENERATED by scripts/build-docs/generate-docs-page.ts
// Do NOT edit by hand. Re-run \`npm run docs:build\`.`;

/** The pages' data module: what the page route and the sitemap read. */
export function renderComponentPagesModule(pages: readonly ComponentPage[]): string {
  return [
    BANNER,
    "// Each component's page under /docs/components/<slug>, in /docs's order.",
    "",
    "export interface DocsComponentPageLink {",
    "  slug: string;",
    "  name: string;",
    "}",
    "",
    "export interface DocsComponentPage extends DocsComponentPageLink {",
    "  /** The manifest's category, and the heading /docs lists it under. */",
    "  category: string;",
    "  categoryLabel: string;",
    "  status: string;",
    `  /** The page title (the site appends "${TITLE_SUFFIX}") and its meta description. */`,
    "  title: string;",
    "  description: string;",
    "  keywords: readonly string[];",
    "  /** The components before and after it in its category, as /docs lists them. */",
    "  previous?: DocsComponentPageLink;",
    "  next?: DocsComponentPageLink;",
    "}",
    "",
    `export const DOCS_COMPONENT_PAGES: readonly DocsComponentPage[] = ${jsLiteral(pages, "")};`,
    "",
  ].join("\n");
}

/** The sections' loaders, by slug: each page imports only its own. */
export function renderComponentSectionsModule(pages: readonly ComponentPage[], fileExt: string): string {
  const moduleOf = (name: string) => `./${name}${fileExt.replace(/\.tsx?$/, "")}`;
  return [
    BANNER,
    "",
    "import type { ComponentType } from 'react';",
    "",
    "/** What every generated section takes. */",
    "export interface DocsSectionProps {",
    "  className?: string;",
    "  /** The level of the section's heading: 2 within /docs, 1 as its component's own page. */",
    "  headingLevel?: 1 | 2;",
    "  /** Where its related components link: their entries on /docs, or their own pages. */",
    "  links?: 'anchors' | 'pages';",
    "}",
    "",
    "/** Each component's generated section, by slug, loaded on demand. */",
    "export const DOCS_COMPONENT_SECTIONS: Readonly<Record<string, () => Promise<{ default: ComponentType<DocsSectionProps> }>>> = {",
    ...pages.map((page) => `  ${jsLiteral(page.slug, "")}: () => import(${jsLiteral(moduleOf(page.name), "")}),`),
    "};",
    "",
  ].join("\n");
}

/** The page modules, by file name, as the docs build writes them from the manifests. */
export function componentPageModules(sources: readonly ComponentPageSource[], fileExt: string): Record<string, string> {
  const pages = componentPages(sources);
  return {
    [COMPONENT_PAGES_FILE]: renderComponentPagesModule(pages),
    [COMPONENT_SECTIONS_FILE]: renderComponentSectionsModule(pages, fileExt),
  };
}
