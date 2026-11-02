import type { FontSpec } from "../../types/thesis";

/** Normalize font names for fuzzy matching (strip spaces, lower-case ASCII). */
export function normalizeFont(name: string | undefined | null): string {
  if (!name) return "";
  return name.replace(/\s+/g, "").toLowerCase();
}

export function fontMatches(actual: string | undefined, allowed: string[]): boolean {
  if (!actual) return false;
  const needle = normalizeFont(actual);
  return allowed.some((name) => {
    const target = normalizeFont(name);
    return needle === target || needle.includes(target) || target.includes(needle);
  });
}

export function fontSpecMatches(actualEast?: string, actualAscii?: string, spec?: FontSpec) {
  if (!spec) return { eastAsia: true, ascii: true };
  return {
    eastAsia: !actualEast || fontMatches(actualEast, spec.eastAsia),
    ascii: !actualAscii || fontMatches(actualAscii, spec.ascii),
  };
}

export function snippetOf(text: string, max = 48) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

let issueSeq = 0;
export function nextIssueId(prefix: string) {
  issueSeq += 1;
  return `${prefix}-${issueSeq}`;
}

export function resetIssueIds() {
  issueSeq = 0;
}
