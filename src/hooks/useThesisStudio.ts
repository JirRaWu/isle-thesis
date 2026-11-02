import { useCallback, useMemo, useState } from "react";
import { SAMPLE_THESIS_NAME, SAMPLE_THESIS_URL, TEMPLATE_STORAGE_KEY } from "@/config/constants";
import { runChecks } from "@/lib/check";
import { describeApplied, fixDocx, parseDocx, type DocModel } from "@/lib/docx";
import {
  createRecordFromTemplate,
  deleteCustomRecord,
  listAllTemplates,
  loadCustomRecords,
  resolveTemplate,
  upsertCustomRecord,
  type CustomTemplateRecord,
} from "@/lib/templates";
import type { CheckIssue, CheckReport, IssueCategory, IssueSeverity } from "@/types/thesis";

function loadTemplateId() {
  try {
    return localStorage.getItem(TEMPLATE_STORAGE_KEY) ?? "generic-gb";
  } catch {
    return "generic-gb";
  }
}

export type StudioPhase = "idle" | "parsing" | "ready" | "error";

export function useThesisStudio() {
  const [customRecords, setCustomRecords] = useState<CustomTemplateRecord[]>(() => {
    try {
      return loadCustomRecords();
    } catch {
      return [];
    }
  });
  const [templateId, setTemplateIdState] = useState(loadTemplateId);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceBuffer, setSourceBuffer] = useState<ArrayBuffer | null>(null);
  const [model, setModel] = useState<DocModel | null>(null);
  const [report, setReport] = useState<CheckReport | null>(null);
  const [phase, setPhase] = useState<StudioPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState(false);
  const [fixNote, setFixNote] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "all">("all");
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState<CustomTemplateRecord | null>(null);

  const templates = useMemo(() => listAllTemplates(customRecords), [customRecords]);
  const template = useMemo(() => resolveTemplate(templateId, customRecords), [templateId, customRecords]);

  const recheck = useCallback(
    (id: string, nextRecords = customRecords) => {
      if (!model) return;
      const next = runChecks(model, resolveTemplate(id, nextRecords));
      setReport(next);
      setActiveIssueId(next.issues[0]?.id ?? null);
    },
    [model, customRecords],
  );

  const setTemplateId = useCallback(
    (id: string) => {
      setTemplateIdState(id);
      try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      recheck(id);
    },
    [recheck],
  );

  const reset = useCallback(() => {
    setFileName(null);
    setSourceBuffer(null);
    setModel(null);
    setReport(null);
    setPhase("idle");
    setError(null);
    setFixNote(null);
    setActiveIssueId(null);
  }, []);

  const analyze = useCallback(
    async (file: File) => {
      setPhase("parsing");
      setError(null);
      setFixNote(null);
      setFileName(file.name);
      try {
        const buffer = await file.arrayBuffer();
        const parsed = await parseDocx(new Blob([buffer]), file.name);
        const nextReport = runChecks(parsed, resolveTemplate(templateId, customRecords));
        setSourceBuffer(buffer);
        setModel(parsed);
        setReport(nextReport);
        setActiveIssueId(nextReport.issues[0]?.id ?? null);
        setPhase("ready");
      } catch (err) {
        setSourceBuffer(null);
        setModel(null);
        setReport(null);
        setPhase("error");
        setError(err instanceof Error ? err.message : "解析失败");
      }
    },
    [templateId, customRecords],
  );

  const loadSample = useCallback(async () => {
    setPhase("parsing");
    setError(null);
    setFixNote(null);
    try {
      const response = await fetch(SAMPLE_THESIS_URL);
      if (!response.ok) throw new Error("样例文件加载失败");
      const blob = await response.blob();
      const file = new File([blob], SAMPLE_THESIS_NAME, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      await analyze(file);
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "样例加载失败");
    }
  }, [analyze]);

  const downloadFixed = useCallback(async () => {
    if (!sourceBuffer || !fileName) return;
    setFixing(true);
    setError(null);
    try {
      const tpl = resolveTemplate(templateId, customRecords);
      const result = await fixDocx(sourceBuffer, tpl, fileName);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      a.click();
      URL.revokeObjectURL(url);

      const parsed = await parseDocx(result.blob, result.fileName);
      const nextReport = runChecks(parsed, tpl);
      const nextBuffer = await result.blob.arrayBuffer();
      setSourceBuffer(nextBuffer);
      setFileName(result.fileName);
      setModel(parsed);
      setReport(nextReport);
      setActiveIssueId(nextReport.issues[0]?.id ?? null);
      setFixNote(`已下载「${result.fileName}」。已应用：${describeApplied(result.applied).join("、")}。`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "修复失败");
    } finally {
      setFixing(false);
    }
  }, [sourceBuffer, fileName, templateId, customRecords]);

  const openCreateCustom = useCallback(() => {
    setEditorDraft(createRecordFromTemplate(template));
    setEditorOpen(true);
  }, [template]);

  const openEditCustom = useCallback(() => {
    const existing = customRecords.find((item) => item.id === templateId);
    if (!existing) return;
    setEditorDraft({ ...existing, headings: existing.headings.map((h) => ({ ...h })) });
    setEditorOpen(true);
  }, [customRecords, templateId]);

  const saveCustom = useCallback(
    (record: CustomTemplateRecord) => {
      const next = upsertCustomRecord(record);
      setCustomRecords(next);
      setTemplateId(record.id);
      setEditorOpen(false);
      setEditorDraft(null);
      recheck(record.id, next);
    },
    [setTemplateId, recheck],
  );

  const removeCustom = useCallback(() => {
    if (!templateId.startsWith("custom-")) return;
    if (!window.confirm("确定删除这个自定义模板？")) return;
    const next = deleteCustomRecord(templateId);
    setCustomRecords(next);
    setTemplateId("generic-gb");
    recheck("generic-gb", next);
  }, [templateId, setTemplateId, recheck]);

  const filteredIssues: CheckIssue[] = useMemo(() => {
    if (!report) return [];
    return report.issues.filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
      return true;
    });
  }, [report, severityFilter, categoryFilter]);

  const activeIssue = useMemo(
    () => report?.issues.find((issue) => issue.id === activeIssueId) ?? filteredIssues[0] ?? null,
    [report, activeIssueId, filteredIssues],
  );

  const previewParagraphs = useMemo(() => {
    if (!model) return [];
    if (!activeIssue || activeIssue.paragraphIndex == null) {
      return model.paragraphs.filter((p) => !p.isEmpty).slice(0, 12);
    }
    const center = activeIssue.paragraphIndex;
    const start = Math.max(0, center - 3);
    return model.paragraphs.slice(start, center + 5);
  }, [model, activeIssue]);

  return {
    templates,
    template,
    templateId,
    setTemplateId,
    fileName,
    model,
    report,
    phase,
    error,
    analyze,
    loadSample,
    reset,
    downloadFixed,
    fixing,
    fixNote,
    canFix: !!sourceBuffer,
    severityFilter,
    setSeverityFilter,
    categoryFilter,
    setCategoryFilter,
    filteredIssues,
    activeIssueId,
    setActiveIssueId,
    activeIssue,
    previewParagraphs,
    editorOpen,
    editorDraft,
    openCreateCustom,
    openEditCustom,
    saveCustom,
    removeCustom,
    closeEditor: () => {
      setEditorOpen(false);
      setEditorDraft(null);
    },
  };
}
