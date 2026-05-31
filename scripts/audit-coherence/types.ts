export type Severity = 'blocker' | 'major' | 'minor';

export interface DriftItem {
  artifact: string;
  expected: string;
  actual: string;
  severity: Severity;
}

export interface GateResult {
  gateId: string;
  description: string;
  drift: DriftItem[];
}

export interface GateContext {
  repoRoot: string;
}

export type Gate = (ctx: GateContext) => Promise<GateResult> | GateResult;
