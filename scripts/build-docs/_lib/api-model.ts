/**
 * The API reference of a UI kit component, per framework, as the docs show
 * it: what extract-api.ts reads from the kits' sources and the generated
 * /docs sections hand to the site's `FrameworkApi` component
 * (apps/web/src/components/FrameworkApi.tsx), which declares the same shape.
 *
 * Text fields are plain text with markdown code spans (`` `true` ``); types
 * and defaults are source text.
 */

/** The frameworks the kit ships for, React first. */
export const API_FRAMEWORKS = ["react", "vue", "angular"] as const;
export type ApiFramework = (typeof API_FRAMEWORKS)[number];

/** The kit package a reader imports, per framework. */
export const KIT_PACKAGES: Readonly<Record<ApiFramework, string>> = {
  react: "@pxlkit/ui-kit",
  vue: "@pxlkit/ui-kit-vue",
  angular: "@pxlkit/ui-kit-angular",
};

/** A prop (React, Vue) or an input (Angular). */
export interface ApiProp {
  name: string;
  /** The type as a reader writes it: unions of literals spelled out. */
  type: string;
  /** The value it takes when unset, as source (`'md'`, `false`, `[]`). */
  default?: string;
  required?: boolean;
  description: string;
  /** Its two-way binding: `v-model`, `v-model:open`, `[(open)]`. */
  binding?: string;
  /** Angular: what the input's transform accepts, where wider than `type`. */
  accepts?: string;
  /** Why it is deprecated, and what replaces it. */
  deprecated?: string;
}

/** An event (Vue `emits`) or an output (Angular). */
export interface ApiEvent {
  name: string;
  /** The payload, as source (`checked: boolean`); empty for none. */
  payload: string;
  description: string;
  deprecated?: string;
}

/** A slot (Vue). */
export interface ApiSlot {
  name: string;
  /** The props the slot passes, as source; empty for none. */
  props: string;
  description: string;
}

/** One component: the documented one, or one of its parts. */
export interface ApiComponent {
  /** `PixelPopover`, a React part (`PixelPopover.Trigger`) or a port's (`PixelPopoverTrigger`). */
  name: string;
  /** Angular: the selector. */
  selector?: string;
  props: ApiProp[];
  events: ApiEvent[];
  slots: ApiSlot[];
  /**
   * One-line notes: the native attributes it also takes (summed up, not
   * listed), where `ref` points, form-control support.
   */
  notes: string[];
}

/** A component's API in one framework. */
export interface ApiReference {
  /** The import statement a reader writes. */
  import: string;
  /** The component, then its parts. */
  components: ApiComponent[];
}

/** A component's API in each framework whose kit has it. */
export type ComponentApi = Partial<Record<ApiFramework, ApiReference>>;

/** Manifest component name → its API. */
export type ApiIndex = ReadonlyMap<string, ComponentApi>;

/** The number of documented members (props, events, slots) of a component. */
export function memberCount(component: ApiComponent): number {
  return component.props.length + component.events.length + component.slots.length;
}

/** Members, all frameworks and parts together, without a description (a deprecation note counts as one). */
export interface UndocumentedMember {
  framework: ApiFramework;
  /** The component or part. */
  component: string;
  kind: "prop" | "event" | "slot";
  name: string;
}

export function undocumentedMembers(api: ComponentApi): UndocumentedMember[] {
  const out: UndocumentedMember[] = [];
  for (const framework of API_FRAMEWORKS) {
    for (const component of api[framework]?.components ?? []) {
      for (const prop of component.props) {
        if (!prop.description && !prop.deprecated) out.push({ framework, component: component.name, kind: "prop", name: prop.name });
      }
      for (const event of component.events) {
        if (!event.description && !event.deprecated) out.push({ framework, component: component.name, kind: "event", name: event.name });
      }
      for (const slot of component.slots) {
        if (!slot.description) out.push({ framework, component: component.name, kind: "slot", name: slot.name });
      }
    }
  }
  return out;
}
