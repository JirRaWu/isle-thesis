import type { ThesisTemplate } from "@/types/thesis";

interface TemplatePickerProps {
  templates: ThesisTemplate[];
  value: string;
  onChange: (id: string) => void;
  onCreateCustom: () => void;
  onEditCustom?: () => void;
  onDeleteCustom?: () => void;
}

export function TemplatePicker({
  templates,
  value,
  onChange,
  onCreateCustom,
  onEditCustom,
  onDeleteCustom,
}: TemplatePickerProps) {
  const current = templates.find((t) => t.id === value) ?? templates[0];
  const isCustom = value.startsWith("custom-");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {templates.map((tpl) => {
          const active = tpl.id === value;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onChange(tpl.id)}
              className={[
                "rounded-full px-3.5 py-1.5 text-sm transition",
                active
                  ? "bg-brand text-white shadow-sm shadow-brand/25"
                  : "bg-white/70 text-ink/70 ring-1 ring-brand/10 hover:text-brand",
              ].join(" ")}
            >
              {tpl.shortName}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onCreateCustom}
          className="rounded-full px-3.5 py-1.5 text-sm text-brand ring-1 ring-dashed ring-brand/30 transition hover:bg-brand/5"
        >
          + 自定义
        </button>
      </div>
      {current && (
        <div className="rounded-xl bg-white/60 px-3.5 py-3 text-xs leading-relaxed text-ink/60 ring-1 ring-brand/8">
          <p className="font-medium text-ink/80">{current.name}</p>
          <p className="mt-1">{current.description}</p>
          <p className="mt-2 text-ink/45">{current.disclaimer}</p>
          {isCustom && (
            <div className="mt-3 flex flex-wrap gap-2">
              {onEditCustom && (
                <button type="button" onClick={onEditCustom} className="rounded-full bg-white px-3 py-1 text-xs text-brand ring-1 ring-brand/15">
                  编辑
                </button>
              )}
              {onDeleteCustom && (
                <button type="button" onClick={onDeleteCustom} className="rounded-full px-3 py-1 text-xs text-danger/80 hover:bg-danger/5">
                  删除
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
