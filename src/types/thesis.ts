/** Issue severity for report sorting and scoring. */
export type IssueSeverity = "error" | "warning" | "info";

/** Logical check categories used for filtering. */
export type IssueCategory =
  | "page"
  | "margin"
  | "font"
  | "size"
  | "spacing"
  | "indent"
  | "heading"
  | "structure"
  | "caption"
  | "reference";

export interface FontSpec {
  /** Preferred Chinese / East-Asian font family names (any match passes). */
  eastAsia: string[];
  /** Preferred Latin / ASCII font family names. */
  ascii: string[];
}

export interface SizeSpec {
  /** Expected font size in points (Word uses half-points internally). */
  pt: number;
  /** Allowed absolute deviation in points. */
  tolerancePt?: number;
}

export interface LineSpacingSpec {
  /** Multiplier: 1 = single, 1.5 = 1.5×, 2 = double. Word auto line = multiplier * 240. */
  multiple: number;
  tolerance?: number;
}

export interface MarginSpecMm {
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** Absolute tolerance in millimetres. */
  toleranceMm?: number;
}

export interface PageSpecMm {
  width: number;
  height: number;
  toleranceMm?: number;
}

export interface HeadingLevelSpec {
  level: 1 | 2 | 3;
  fonts: FontSpec;
  size: SizeSpec;
  bold?: boolean;
  /** Optional fixed line spacing for headings. */
  lineSpacing?: LineSpacingSpec;
}

export interface StructureMarker {
  id: string;
  /** Display label in the UI. */
  label: string;
  /** Case-insensitive match against paragraph text (trimmed). */
  patterns: RegExp[];
  severity: IssueSeverity;
}

export interface CaptionSpec {
  id: string;
  label: string;
  patterns: RegExp[];
}

/** Declarative template a university / standard can ship. */
export interface ThesisTemplate {
  id: string;
  name: string;
  shortName: string;
  description: string;
  /** Disclaimer shown in UI — templates are approximations of common rules. */
  disclaimer: string;
  page: PageSpecMm;
  margins: MarginSpecMm;
  body: {
    fonts: FontSpec;
    size: SizeSpec;
    lineSpacing: LineSpacingSpec;
    firstLineIndentChars?: number;
  };
  headings: HeadingLevelSpec[];
  structure: StructureMarker[];
  captions: CaptionSpec[];
  /** Max consecutive empty paragraphs before a warning. */
  maxConsecutiveEmpty?: number;
}

export interface CheckIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  detail: string;
  /** How to fix in Word, in plain language. */
  fixHint: string;
  /** 0-based paragraph index when the issue maps to a paragraph. */
  paragraphIndex?: number;
  /** Short snippet from the document for orientation. */
  snippet?: string;
  expected?: string;
  actual?: string;
}

export interface CheckSummary {
  errors: number;
  warnings: number;
  infos: number;
  /** 0–100, weighted by severity. */
  score: number;
}

export interface CheckReport {
  templateId: string;
  templateName: string;
  fileName: string;
  checkedAt: string;
  paragraphCount: number;
  issues: CheckIssue[];
  summary: CheckSummary;
}
