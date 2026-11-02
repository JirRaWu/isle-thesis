import type { CheckIssue, IssueCategory, IssueSeverity } from "@/types/thesis";

const SEVERITY_OPTIONS: { id: IssueSeverity | "all"; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "error", label: "错误" },
  { id: "warning", label: "警告" },
  { id: "info", label: "提示" },
];

const CATEGORY_OPTIONS: { id: IssueCategory | "all"; label: string }[] = [
  { id: "all", label: "全部分类" },
  { id: "page", label: "纸张" },
  { id: "margin", label: "页边距" },
  { id: "font", label: "字体" },
  { id: "size", label: "字号" },
  { id: "spacing", label: "行距" },
  { id: "indent", label: "缩进" },
  { id: "heading", label: "标题" },
  { id: "structure", label: "结构" },
  { id: "caption", label: "题注" },
];

function severityTone(sev: IssueSeverity) {
  if (sev === "error") return "bg-danger/10 text-danger";
  if (sev === "warning") return "bg-warn/10 text-warn";
  return "bg-brand/10 text-brand";
}

function severityLabel(sev: IssueSeverity) {
  if (sev === "error") return "错误";
  if (sev === "warning") return "警告";
  return "提示";
}

interface IssueListProps {
  issues: CheckIssue[];
  activeId: string | null;
  onSelect: (id: string) => void;
  severityFilter: IssueSeverity | "all";
  categoryFilter: IssueCategory | "all";
  onSeverityFilter: (v: IssueSeverity | "all") => void;
  onCategoryFilter: (v: IssueCategory | "all") => void;
}

export function IssueList({
  issues,
  activeId,
  onSelect,
  severityFilter,
  categoryFilter,
  onSeverityFilter,
  onCategoryFilter,
}: IssueListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SEVERITY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSeverityFilter(opt.id)}
            className={[
              "rounded-full px-2.5 py-1 text-xs transition",
              severityFilter === opt.id ? "bg-ink text-white" : "bg-white/70 text-ink/55 ring-1 ring-brand/10",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        className="field-input"
        value={categoryFilter}
        onChange={(e) => onCategoryFilter(e.target.value as IssueCategory | "all")}
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {!issues.length && (
          <p className="rounded-xl bg-ok/8 px-3 py-4 text-sm text-ok">当前筛选下没有问题。</p>
        )}
        {issues.map((issue) => {
          const active = issue.id === activeId;
          return (
            <button
              key={issue.id}
              type="button"
              onClick={() => onSelect(issue.id)}
              className={[
                "w-full rounded-xl px-3 py-2.5 text-left transition",
                active ? "bg-brand/10 ring-1 ring-brand/30" : "bg-white/65 ring-1 ring-brand/8 hover:bg-white/90",
              ].join(" ")}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityTone(issue.severity)}`}>
                  {severityLabel(issue.severity)}
                </span>
                <span className="truncate text-xs text-ink/40">{issue.category}</span>
              </div>
              <p className="text-sm font-medium text-ink">{issue.title}</p>
              {issue.snippet && <p className="mt-1 truncate text-xs text-ink/45">{issue.snippet}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
