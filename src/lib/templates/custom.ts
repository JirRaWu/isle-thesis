import { CUSTOM_TEMPLATES_KEY } from "../../config/constants";
import type { HeadingLevelSpec, MarginSpecMm, ThesisTemplate } from "../../types/thesis";
import { getBuiltinTemplate, THESIS_TEMPLATES } from "./builtins";

/** Editable fields persisted for a user-defined template (structure rules inherit from base). */
export interface CustomTemplateRecord {
  id: string;
  baseId: string;
  name: string;
  shortName: string;
  margins: MarginSpecMm;
  body: {
    eastAsia: string;
    ascii: string;
    sizePt: number;
    lineMultiple: number;
    firstLineIndentChars: number;
  };
  headings: Array<{
    level: 1 | 2 | 3;
    eastAsia: string;
    ascii: string;
    sizePt: number;
    bold: boolean;
  }>;
  updatedAt: string;
}

export function createRecordFromTemplate(base: ThesisTemplate, name?: string): CustomTemplateRecord {
  return {
    id: `custom-${crypto.randomUUID().slice(0, 8)}`,
    baseId: base.id.startsWith("custom-") ? "generic-gb" : base.id,
    name: name?.trim() || `${base.shortName} · 自定义`,
    shortName: name?.trim()?.slice(0, 8) || "自定义",
    margins: { ...base.margins },
    body: {
      eastAsia: base.body.fonts.eastAsia[0] ?? "宋体",
      ascii: base.body.fonts.ascii[0] ?? "Times New Roman",
      sizePt: base.body.size.pt,
      lineMultiple: base.body.lineSpacing.multiple,
      firstLineIndentChars: base.body.firstLineIndentChars ?? 2,
    },
    headings: base.headings.map((h) => ({
      level: h.level,
      eastAsia: h.fonts.eastAsia[0] ?? "黑体",
      ascii: h.fonts.ascii[0] ?? "Times New Roman",
      sizePt: h.size.pt,
      bold: h.bold ?? true,
    })),
    updatedAt: new Date().toISOString(),
  };
}

function withAliases(primary: string, extras: string[]) {
  return Array.from(new Set([primary, ...extras.filter(Boolean)]));
}

export function materializeCustom(record: CustomTemplateRecord): ThesisTemplate {
  const base = getBuiltinTemplate(record.baseId);
  const headings: HeadingLevelSpec[] = record.headings.map((h) => {
    const fallback = base.headings.find((x) => x.level === h.level) ?? base.headings[0]!;
    return {
      level: h.level,
      fonts: {
        eastAsia: withAliases(h.eastAsia, fallback.fonts.eastAsia),
        ascii: withAliases(h.ascii, fallback.fonts.ascii),
      },
      size: { pt: h.sizePt, tolerancePt: fallback.size.tolerancePt ?? 1 },
      bold: h.bold,
      lineSpacing: fallback.lineSpacing,
    };
  });

  return {
    ...base,
    id: record.id,
    name: record.name,
    shortName: record.shortName || "自定义",
    description: `基于「${base.shortName}」的本机自定义模板。`,
    disclaimer: "自定义模板仅保存在本机浏览器；清除站点数据后会丢失。",
    margins: {
      ...record.margins,
      toleranceMm: record.margins.toleranceMm ?? base.margins.toleranceMm ?? 2,
    },
    body: {
      fonts: {
        eastAsia: withAliases(record.body.eastAsia, base.body.fonts.eastAsia),
        ascii: withAliases(record.body.ascii, base.body.fonts.ascii),
      },
      size: { pt: record.body.sizePt, tolerancePt: base.body.size.tolerancePt ?? 0.5 },
      lineSpacing: {
        multiple: record.body.lineMultiple,
        tolerance: base.body.lineSpacing.tolerance ?? 0.08,
      },
      firstLineIndentChars: record.body.firstLineIndentChars,
    },
    headings,
  };
}

function isRecord(value: unknown): value is CustomTemplateRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as CustomTemplateRecord;
  return typeof r.id === "string" && r.id.startsWith("custom-") && typeof r.baseId === "string" && !!r.margins && !!r.body;
}

export function loadCustomRecords(): CustomTemplateRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord);
  } catch {
    return [];
  }
}

export function saveCustomRecords(records: CustomTemplateRecord[]) {
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(records));
}

export function upsertCustomRecord(record: CustomTemplateRecord) {
  const next = loadCustomRecords().filter((item) => item.id !== record.id);
  next.unshift({ ...record, updatedAt: new Date().toISOString() });
  saveCustomRecords(next);
  return next;
}

export function deleteCustomRecord(id: string) {
  const next = loadCustomRecords().filter((item) => item.id !== id);
  saveCustomRecords(next);
  return next;
}

export function listAllTemplates(records: CustomTemplateRecord[] = loadCustomRecords()): ThesisTemplate[] {
  return [...THESIS_TEMPLATES, ...records.map(materializeCustom)];
}

export function resolveTemplate(id: string, records: CustomTemplateRecord[] = loadCustomRecords()): ThesisTemplate {
  const custom = records.find((item) => item.id === id);
  if (custom) return materializeCustom(custom);
  return getBuiltinTemplate(id);
}
