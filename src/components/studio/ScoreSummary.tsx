import type { CheckReport } from "@/types/thesis";

interface ScoreSummaryProps {
  report: CheckReport;
  onExport: () => void;
  onReset: () => void;
}

export function ScoreSummary({ report, onExport, onReset }: ScoreSummaryProps) {
  const { summary } = report;
  const tone =
    summary.score >= 85 ? "text-ok" : summary.score >= 60 ? "text-warn" : "text-danger";

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-brand/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-end gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink/45">格式得分</p>
          <p className={`font-display text-4xl font-semibold leading-none ${tone}`}>{summary.score}</p>
        </div>
        <div className="mb-1 space-y-0.5 text-xs text-ink/55">
          <p>
            错误 <span className="font-medium text-danger">{summary.errors}</span>
          </p>
          <p>
            警告 <span className="font-medium text-warn">{summary.warnings}</span>
          </p>
          <p>
            提示 <span className="font-medium text-ink/70">{summary.infos}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
        >
          导出报告
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-white px-4 py-2 text-sm text-ink/70 ring-1 ring-brand/15 transition hover:text-brand"
        >
          换一份
        </button>
      </div>
    </div>
  );
}
