/**
 * What the coherence audit holds the generated API reference to
 * (scripts/audit-coherence/gates/38-api-reference.ts): every documented
 * component has an API reference in React, Vue and Angular that lists
 * something — or states why it lists nothing — and its /docs section shows
 * that reference as the kits' sources have it now.
 */
import { API_FRAMEWORKS, memberCount, undocumentedMembers, type ApiFramework, type ApiIndex } from "./api-model.js";
import { hasApi, renderApiConstant } from "./api-section.js";

export type ApiFindingSeverity = "major" | "minor" | "info";

export interface ApiFinding {
  severity: ApiFindingSeverity;
  component?: string;
  file?: string;
  message: string;
  suggestion?: string;
}

/** `<framework> <Component>` → why its reference lists no prop, event or slot. */
export type EmptyReferenceReasons = Readonly<Record<string, string>>;

export interface ApiCoherenceInput {
  index: ApiIndex;
  /** Each component's generated section (its path, relative to the repository, and its source; no source when missing). */
  sections: ReadonlyMap<string, { file: string; source?: string }>;
  /** Ports whose kit is released at the React kit's version: a component they lack is an error, not work in progress. */
  released: ReadonlySet<ApiFramework>;
  emptyReasons: EmptyReferenceReasons;
}

const REGENERATE = "Run `npm run docs:build` and commit the regenerated sections.";

export function apiCoherenceFindings({ index, sections, released, emptyReasons }: ApiCoherenceInput): ApiFinding[] {
  const findings: ApiFinding[] = [];
  const usedReasons = new Set<string>();
  for (const [name, api] of index) {
    for (const framework of API_FRAMEWORKS) {
      const reference = api[framework];
      if (!reference) {
        const blocking = framework === "react" || released.has(framework);
        findings.push({
          severity: blocking ? "major" : "info",
          component: name,
          message: `${name} has no ${framework} API reference: its kit does not export it, or its source cannot be read.`,
          suggestion: blocking
            ? `Export ${name} from the ${framework} kit's entry module, as a component the extractor reads (scripts/build-docs/_lib/api-${framework}.ts).`
            : "The docs show its tab disabled until the kit has it.",
        });
        continue;
      }
      const main = reference.components[0];
      const key = `${framework} ${name}`;
      if (main && memberCount(main) === 0) {
        if (emptyReasons[key]) usedReasons.add(key);
        else {
          findings.push({
            severity: "major",
            component: name,
            message: `${name}'s ${framework} API reference lists no prop, event or slot.`,
            suggestion: `Check that the extractor reads its ${framework} source; if it really takes none, say why in the gate's empty-reference reasons ("${key}").`,
          });
        }
      }
    }
    const section = sections.get(name);
    if (!hasApi(api) || !section) continue;
    if (section.source === undefined) {
      findings.push({ severity: "major", component: name, file: section.file, message: `${section.file} is missing.`, suggestion: REGENERATE });
    } else if (!section.source.includes("<FrameworkApi ") || !section.source.includes(renderApiConstant(name, api))) {
      findings.push({
        severity: "major",
        component: name,
        file: section.file,
        message: `${section.file} does not show ${name}'s API as its kits' sources have it.`,
        suggestion: REGENERATE,
      });
    }
  }
  for (const key of Object.keys(emptyReasons).sort()) {
    if (usedReasons.has(key)) continue;
    findings.push({
      severity: "minor",
      message: `The empty-reference reason for "${key}" no longer applies: that reference lists members now, or is gone.`,
      suggestion: "Remove the reason from the gate.",
    });
  }
  const missing = [...index].flatMap(([owner, api]) => undocumentedMembers(api).map((member) => ({ owner, ...member })));
  for (const framework of API_FRAMEWORKS) {
    const members = missing.filter((member) => member.framework === framework);
    if (members.length === 0) continue;
    findings.push({
      severity: "info",
      message: `${members.length} ${framework} props, events or slots have no description: ${members
        .map((member) => `${member.component}.${member.name}`)
        .join(", ")}.`,
      suggestion: "Describe each in a doc comment where it is declared.",
    });
  }
  return findings;
}
