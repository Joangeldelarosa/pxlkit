import pc from "picocolors";

export interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
  success(msg: string): void;
  table(data: Record<string, unknown>[]): void;
}

function timestamp(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function format(level: string, colorFn: (s: string) => string, msg: string): string {
  return `${pc.dim(timestamp())} ${colorFn(level)} ${msg}`;
}

function renderTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return pc.dim("(empty)");
  }
  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );

  const stringify = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  const widths = headers.map((h) =>
    Math.max(h.length, ...rows.map((row) => stringify(row[h]).length)),
  );

  const pad = (cell: string, width: number): string => cell + " ".repeat(width - cell.length);
  const top = `+${widths.map((w) => "-".repeat(w + 2)).join("+")}+`;
  const headerRow = `| ${headers.map((h, i) => pad(h, widths[i]!)).join(" | ")} |`;
  const sep = top;
  const dataRows = rows.map(
    (row) => `| ${headers.map((h, i) => pad(stringify(row[h]), widths[i]!)).join(" | ")} |`,
  );

  return [top, headerRow, sep, ...dataRows, top].join("\n");
}

export function createLogger(prefix?: string): Logger {
  const tag = prefix ? pc.magenta(`[${prefix}] `) : "";
  return {
    info(msg: string) {
      // eslint-disable-next-line no-console
      console.log(format("INFO ", pc.cyan, `${tag}${msg}`));
    },
    warn(msg: string) {
      // eslint-disable-next-line no-console
      console.warn(format("WARN ", pc.yellow, `${tag}${msg}`));
    },
    error(msg: string) {
      // eslint-disable-next-line no-console
      console.error(format("ERROR", pc.red, `${tag}${msg}`));
    },
    success(msg: string) {
      // eslint-disable-next-line no-console
      console.log(format("OK   ", pc.green, `${tag}${msg}`));
    },
    table(data: Record<string, unknown>[]) {
      // eslint-disable-next-line no-console
      console.log(renderTable(data));
    },
  };
}

export const defaultLogger: Logger = createLogger();
