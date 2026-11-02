import { useState } from "react";
import { useAiConfig } from "@/hooks/useAiConfig";
import { useThesisStudio } from "@/hooks/useThesisStudio";
import { downloadReport } from "@/lib/report/export";
import { AiSettings } from "./AiSettings";
import { DocPreview } from "./DocPreview";
import { IssueDetail } from "./IssueDetail";
import { IssueList } from "./IssueList";
import { ScoreSummary } from "./ScoreSummary";
import { TemplateEditor } from "./TemplateEditor";
import { TemplatePicker } from "./TemplatePicker";
import { UploadDropzone } from "./UploadDropzone";

export function ThesisStudio() {
  const studio = useThesisStudio();
  const ai = useAiConfig();
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <section id="studio" className="animate-fade space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/55 p-4 ring-1 ring-brand/10">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink/40">1. 选择规范模板</p>
            <TemplatePicker
              templates={studio.templates}
              value={studio.templateId}
              onChange={studio.setTemplateId}
              onCreateCustom={studio.openCreateCustom}
              onEditCustom={studio.openEditCustom}
              onDeleteCustom={studio.removeCustom}
            />
          </div>

          <div className="rounded-2xl bg-white/55 p-4 ring-1 ring-brand/10">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink/40">2. 上传论文 DOCX</p>
            {studio.phase === "parsing" ? (
              <div className="flex min-h-[168px] items-center justify-center rounded-2xl bg-brand/5 text-sm text-brand">
                正在本地解析 OOXML…
              </div>
            ) : studio.phase === "ready" ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand/5 px-4 py-4 text-sm">
                <div>
                  <p className="font-medium text-ink">{studio.fileName}</p>
                  <p className="mt-0.5 text-xs text-ink/45">
                    {studio.model?.paragraphs.length ?? 0} 个段落 · 模板 {studio.template.shortName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={studio.reset}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs text-brand ring-1 ring-brand/20 hover:bg-white"
                >
                  重新上传
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <UploadDropzone onFile={(file) => void studio.analyze(file)} />
                <button
                  type="button"
                  onClick={() => void studio.loadSample()}
                  className="w-full rounded-xl bg-brand/5 px-3 py-2.5 text-sm text-brand ring-1 ring-brand/15 transition hover:bg-brand/10"
                >
                  试用样例论文（含故意埋的格式问题）
                </button>
              </div>
            )}
            {studio.error && <p className="mt-2 text-xs text-danger">{studio.error}</p>}
          </div>
        </div>

        <DocPreview
          paragraphs={studio.previewParagraphs}
          highlightIndex={studio.activeIssue?.paragraphIndex}
          fileName={studio.fileName}
        />
      </div>

      {studio.report && studio.phase === "ready" && (
        <div className="space-y-4">
          <ScoreSummary
            report={studio.report}
            canFix={studio.canFix}
            fixing={studio.fixing}
            fixNote={studio.fixNote}
            onFix={() => void studio.downloadFixed()}
            onExport={() => downloadReport(studio.report!)}
            onReset={studio.reset}
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
            <div className="min-h-[360px] rounded-2xl bg-white/55 p-3 ring-1 ring-brand/10">
              <IssueList
                issues={studio.filteredIssues}
                activeId={studio.activeIssue?.id ?? null}
                onSelect={studio.setActiveIssueId}
                severityFilter={studio.severityFilter}
                categoryFilter={studio.categoryFilter}
                onSeverityFilter={studio.setSeverityFilter}
                onCategoryFilter={studio.setCategoryFilter}
              />
            </div>
            <IssueDetail
              issue={studio.activeIssue}
              aiConfig={ai.config}
              onOpenAiSettings={() => setAiOpen(true)}
            />
          </div>
        </div>
      )}

      <AiSettings
        open={aiOpen}
        config={ai.config}
        onClose={() => setAiOpen(false)}
        onUpdate={ai.update}
        onSwitchProvider={ai.switchProvider}
        onReset={ai.reset}
      />
      <TemplateEditor
        open={studio.editorOpen}
        draft={studio.editorDraft}
        onClose={studio.closeEditor}
        onSave={studio.saveCustom}
      />
    </section>
  );
}
