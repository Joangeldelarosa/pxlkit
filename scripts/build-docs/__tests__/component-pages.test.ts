/**
 * Tests for _lib/component-pages.ts: each component's own page on the site —
 * what it is called (title), how search results describe it (description),
 * its order and neighbours, and the two modules the page and the sitemap
 * read — on hand-made cases and on every manifest of the repository.
 */

import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  COMPONENT_CATEGORIES,
  DESCRIPTION_MAX,
  TITLE_MAX,
  TITLE_SUFFIX,
  componentNoun,
  componentPageDescription,
  componentPageModules,
  componentPageKeywords,
  componentPageTitle,
  componentPages,
  renderComponentPagesModule,
  renderComponentSectionsModule,
  shorterLeads,
  type ComponentPageSource,
} from "../_lib/component-pages";
import { scanManifests } from "../scan-manifests";
import { planEntryFor } from "../generate-docs-page";

const repoRoot = path.resolve(__dirname, "../../..");

const source = (name: string, extras: Partial<ComponentPageSource> = {}): ComponentPageSource => ({
  name,
  slug: name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  category: "actions",
  status: "stable",
  description: `${name} lead.`,
  ...extras,
});

describe("componentNoun", () => {
  it("names what a component is from its name's words, without the kit's prefix", () => {
    expect(componentNoun("PixelButton")).toBe("Button");
    expect(componentNoun("PixelDateRangePicker")).toBe("Date Range Picker");
    expect(componentNoun("PixelOTPInput")).toBe("OTP Input");
    expect(componentNoun("PxlKitToastProvider")).toBe("Toast Provider");
    expect(componentNoun("PixelKbd")).toBe("Kbd");
  });
});

describe("componentPageTitle", () => {
  it("says React first, and what the component is", () => {
    expect(componentPageTitle({ name: "PixelButton", status: "stable" })).toBe("PixelButton — React Button Component");
  });

  it("drops 'Component' where the site's suffix would take the title past 60 characters", () => {
    const title = componentPageTitle({ name: "PixelDateRangePicker", status: "stable" });
    expect(title).toBe("PixelDateRangePicker — React Date Range Picker");
    expect(`${title}${TITLE_SUFFIX}`.length).toBeLessThanOrEqual(TITLE_MAX);
  });

  it("says when a component is deprecated", () => {
    expect(componentPageTitle({ name: "PxlKitButton", status: "deprecated" })).toBe("PxlKitButton — Deprecated React Button");
  });
});

describe("shorterLeads", () => {
  it("cuts a 'with' list after its first items, ending it with 'and'", () => {
    const forms = shorterLeads("Versatile button primitive with tone, size, variant, surface, and icon slots for links");
    expect(forms).toContain("Versatile button primitive with tone, size and variant");
    expect(forms).toContain("Versatile button primitive");
  });

  it("leaves parentheses out, and never ends on half of one", () => {
    const forms = shorterLeads("Controlled chip row with single-select (radiogroup) or multi-select (checkboxes) — wraps each chip");
    expect(forms).toContain("Controlled chip row with single-select or multi-select");
    expect(forms.every((form) => (form.match(/\(/g)?.length ?? 0) === (form.match(/\)/g)?.length ?? 0))).toBe(true);
  });

  it("cuts before a comma that ends a phrase, never on a dangling word or a lone list item", () => {
    const forms = shorterLeads("Quick horizontal shake animation, ideal for validation errors or attention cues");
    expect(forms).toContain("Quick horizontal shake animation");
    expect(forms).not.toContain("Quick horizontal shake animation, ideal");
    expect(forms.some((form) => /\b(for|or|and)$/.test(form))).toBe(false);
  });
});

describe("componentPageDescription", () => {
  it("says what the component is for React, what the page holds, and that Vue and Angular have it too", () => {
    expect(componentPageDescription({ name: "PixelSwitch", description: "Two-state toggle switch." })).toBe(
      "PixelSwitch for React: two-state toggle switch. Props, examples and accessibility — in Vue and Angular too.",
    );
  });

  it("keeps a name's capitals at the start of the lead (`Embla-powered`, `SSR-safe`)", () => {
    expect(componentPageDescription({ name: "PixelPortal", description: "SSR-safe portal primitive." })).toContain(
      "PixelPortal for React: SSR-safe portal primitive.",
    );
  });

  it("shortens a long lead to a whole phrase that fits 155 characters", () => {
    const description = componentPageDescription({
      name: "PixelButton",
      description:
        "Versatile button primitive with tone, size, variant, surface, icon slots, loading state, and an asChild slot pattern for wrapping links or routers.",
    });
    expect(description).toBe(
      "PixelButton for React: versatile button primitive with tone, size, variant and surface. Props, examples and accessibility — in Vue and Angular too.",
    );
    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });
});

describe("componentPages", () => {
  const pages = componentPages([
    source("PixelSwitch", { category: "forms" }),
    source("PixelButton"),
    source("PixelBareButton"),
    source("PixelCheckbox", { category: "forms" }),
    source("PixelFadeIn", { category: "animations" }),
  ]);

  it("lists the pages in /docs's order: by category, then slug", () => {
    expect(pages.map((page) => page.slug)).toEqual([
      "pixel-bare-button",
      "pixel-button",
      "pixel-checkbox",
      "pixel-switch",
      "pixel-fade-in",
    ]);
    expect(pages.map((page) => page.categoryLabel)).toEqual(["Actions", "Actions", "Forms", "Forms", "Animations"]);
  });

  it("links each page to its neighbours within its category only", () => {
    const bySlug = new Map(pages.map((page) => [page.slug, page]));
    expect(bySlug.get("pixel-bare-button")).toMatchObject({ next: { slug: "pixel-button", name: "PixelButton" } });
    expect(bySlug.get("pixel-bare-button")!.previous).toBeUndefined();
    expect(bySlug.get("pixel-button")!.next).toBeUndefined();
    expect(bySlug.get("pixel-switch")).toMatchObject({ previous: { slug: "pixel-checkbox" } });
    expect(bySlug.get("pixel-fade-in")!.previous).toBeUndefined();
  });

  it("gives each page its search terms, React first", () => {
    expect(componentPageKeywords("PixelButton")).toEqual([
      "pixelbutton",
      "react button component",
      "pxlkit button",
      "vue button component",
      "angular button component",
    ]);
  });

  it("renders the pages' data module and the sections' loaders", () => {
    const data = renderComponentPagesModule(pages);
    expect(data).toContain("export const DOCS_COMPONENT_PAGES: readonly DocsComponentPage[] = [");
    expect(data).toContain("title: 'PixelButton — React Button Component',");
    expect(data).toContain("next: { slug: 'pixel-button', name: 'PixelButton' },");
    const loaders = renderComponentSectionsModule(pages, ".section.tsx");
    expect(loaders).toContain("export const DOCS_COMPONENT_SECTIONS");
    expect(loaders).toContain("  'pixel-button': () => import('./PixelButton.section'),");
    expect(loaders).toContain("  headingLevel?: 1 | 2;");
  });

  it("names the modules as the docs build writes them, beside the sections", () => {
    const modules = componentPageModules([source("PixelButton")], ".section.tsx");
    expect(Object.keys(modules)).toEqual(["component-pages.generated.ts", "component-sections.generated.ts"]);
    expect(modules["component-sections.generated.ts"]).toContain("() => import('./PixelButton.section')");
  });

  it("knows every category /docs lists", () => {
    expect(COMPONENT_CATEGORIES.map((category) => category.id)).toEqual([
      "actions",
      "forms",
      "data",
      "cards",
      "hero",
      "feedback",
      "navigation",
      "overlays",
      "overlay-foundation",
      "layout",
      "animations",
      "parallax",
    ]);
  });
});

describe("the repository's component pages", () => {
  it("fit search results: titles of at most 60 characters with the site's suffix, descriptions of at most 155, all unique", async () => {
    const records = await scanManifests(repoRoot, {
      continueOnError: true,
      logger: { info() {}, warn() {}, error() {}, success() {}, table() {} },
    });
    const pages = componentPages(records.map((record) => planEntryFor(record, "/o")));
    expect(pages.length).toBeGreaterThanOrEqual(100);
    for (const page of pages) {
      expect(`${page.title}${TITLE_SUFFIX}`.length, page.title).toBeLessThanOrEqual(TITLE_MAX);
      expect(page.description.length, page.description).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(page.description, page.name).toMatch(/^\S+ for React: .+ — in Vue and Angular too\.$/);
      expect(COMPONENT_CATEGORIES.some((category) => category.id === page.category), page.name).toBe(true);
    }
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.description)).size).toBe(pages.length);
  }, 120_000);
});
