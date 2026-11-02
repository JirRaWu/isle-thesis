import type { ThesisTemplate } from "@/types/thesis";

interface TemplatePickerProps {
  templates: ThesisTemplate[];
  value: string;
  onChange: (id: string) => void;
}

export function TemplatePicker({ templates, value, onChange }: TemplatePickerProps) {
  const current = templates.find((t) => t.id === value) ?? templates[0];
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
      </div>
      {current && (
        <div className="rounded-xl bg-white/60 px-3.5 py-3 text-xs leading-relaxed text-ink/60 ring-1 ring-brand/8">
          <p className="font-medium text-ink/80">{current.name}</p>
          <p className="mt-1">{current.description}</p>
          <p className="mt-2 text-ink/45">{current.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
