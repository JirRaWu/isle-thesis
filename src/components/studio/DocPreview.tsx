import type { DocParagraph } from "@/lib/docx";

interface DocPreviewProps {
  paragraphs: DocParagraph[];
  highlightIndex?: number;
  fileName?: string | null;
}

export function DocPreview({ paragraphs, highlightIndex, fileName }: DocPreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 shadow-[0_20px_50px_-28px_rgba(3,105,160,0.35)] ring-1 ring-brand/10">
      <div className="flex items-center justify-between border-b border-brand/8 px-4 py-2.5 text-xs text-ink/45">
        <span>文档预览（附近段落）</span>
        <span className="truncate pl-4">{fileName}</span>
      </div>
      <div className="max-h-[420px] space-y-2 overflow-y-auto px-4 py-4">
        {!paragraphs.length && <p className="text-sm text-ink/40">上传文档后在此预览相关段落。</p>}
        {paragraphs.map((p) => {
          const active = p.index === highlightIndex;
          const heading = p.outlineLvl != null && p.outlineLvl <= 2;
          return (
            <p
              key={p.index}
              className={[
                "rounded-lg px-2 py-1.5 text-sm leading-relaxed transition",
                active ? "bg-brand/12 ring-1 ring-brand/25" : "hover:bg-ink/[0.03]",
                heading ? "font-semibold text-ink" : "text-ink/75",
                p.isEmpty ? "text-ink/25 italic" : "",
              ].join(" ")}
            >
              <span className="mr-2 inline-block w-7 shrink-0 text-[10px] text-ink/30">{p.index + 1}</span>
              {p.isEmpty ? "（空段）" : p.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
