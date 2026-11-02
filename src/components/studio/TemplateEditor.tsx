import { useEffect, useState, type ReactNode } from "react";
import type { CustomTemplateRecord } from "@/lib/templates";

interface TemplateEditorProps {
  open: boolean;
  draft: CustomTemplateRecord | null;
  onClose: () => void;
  onSave: (record: CustomTemplateRecord) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs text-ink/50">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function TemplateEditor({ open, draft, onClose, onSave }: TemplateEditorProps) {
  const [record, setRecord] = useState<CustomTemplateRecord | null>(draft);

  useEffect(() => {
    setRecord(draft);
  }, [draft]);

  if (!open || !record) return null;

  const patch = (partial: Partial<CustomTemplateRecord>) => setRecord({ ...record, ...partial });
  const patchBody = (partial: Partial<CustomTemplateRecord["body"]>) =>
    setRecord({ ...record, body: { ...record.body, ...partial } });
  const patchMargins = (partial: Partial<CustomTemplateRecord["margins"]>) =>
    setRecord({ ...record, margins: { ...record.margins, ...partial } });
  const patchHeading = (level: 1 | 2 | 3, partial: Partial<CustomTemplateRecord["headings"][number]>) =>
    setRecord({
      ...record,
      headings: record.headings.map((h) => (h.level === level ? { ...h, ...partial } : h)),
    });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-4 sm:items-center" role="dialog" aria-modal>
      <div className="animate-rise max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-paper p-5 shadow-xl ring-1 ring-brand/15">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">编辑自定义模板</h2>
            <p className="mt-1 text-xs text-ink/50">保存在本机浏览器。结构检查规则继承自基础模板。</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-ink/45 hover:text-ink">
            关闭
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="模板名称">
            <input className="field-input" value={record.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>
          <Field label="短名（按钮文字）">
            <input
              className="field-input"
              value={record.shortName}
              onChange={(e) => patch({ shortName: e.target.value.slice(0, 10) })}
            />
          </Field>
        </div>

        <h3 className="mb-2 mt-5 text-sm font-medium text-ink">页边距（mm）</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["上", "top"],
              ["下", "bottom"],
              ["左", "left"],
              ["右", "right"],
            ] as const
          ).map(([label, key]) => (
            <Field key={key} label={label}>
              <input
                className="field-input"
                type="number"
                step="0.5"
                value={record.margins[key]}
                onChange={(e) => patchMargins({ [key]: Number(e.target.value) })}
              />
            </Field>
          ))}
        </div>

        <h3 className="mb-2 mt-5 text-sm font-medium text-ink">正文</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="中文字体">
            <input className="field-input" value={record.body.eastAsia} onChange={(e) => patchBody({ eastAsia: e.target.value })} />
          </Field>
          <Field label="西文字体">
            <input className="field-input" value={record.body.ascii} onChange={(e) => patchBody({ ascii: e.target.value })} />
          </Field>
          <Field label="字号（磅）">
            <input
              className="field-input"
              type="number"
              step="0.5"
              value={record.body.sizePt}
              onChange={(e) => patchBody({ sizePt: Number(e.target.value) })}
            />
          </Field>
          <Field label="行距（倍）">
            <input
              className="field-input"
              type="number"
              step="0.1"
              value={record.body.lineMultiple}
              onChange={(e) => patchBody({ lineMultiple: Number(e.target.value) })}
            />
          </Field>
          <Field label="首行缩进（字符）">
            <input
              className="field-input"
              type="number"
              step="1"
              value={record.body.firstLineIndentChars}
              onChange={(e) => patchBody({ firstLineIndentChars: Number(e.target.value) })}
            />
          </Field>
        </div>

        <h3 className="mb-2 mt-5 text-sm font-medium text-ink">标题</h3>
        <div className="space-y-3">
          {record.headings.map((h) => (
            <div key={h.level} className="grid gap-2 rounded-xl bg-white/70 p-3 ring-1 ring-brand/8 sm:grid-cols-5">
              <p className="text-xs font-medium text-ink/70 sm:col-span-5">{h.level} 级标题</p>
              <Field label="中文字体">
                <input
                  className="field-input"
                  value={h.eastAsia}
                  onChange={(e) => patchHeading(h.level, { eastAsia: e.target.value })}
                />
              </Field>
              <Field label="西文字体">
                <input
                  className="field-input"
                  value={h.ascii}
                  onChange={(e) => patchHeading(h.level, { ascii: e.target.value })}
                />
              </Field>
              <Field label="字号">
                <input
                  className="field-input"
                  type="number"
                  step="0.5"
                  value={h.sizePt}
                  onChange={(e) => patchHeading(h.level, { sizePt: Number(e.target.value) })}
                />
              </Field>
              <Field label="加粗">
                <select
                  className="field-input"
                  value={h.bold ? "1" : "0"}
                  onChange={(e) => patchHeading(h.level, { bold: e.target.value === "1" })}
                >
                  <option value="1">是</option>
                  <option value="0">否</option>
                </select>
              </Field>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSave(record)}
            className="rounded-full bg-brand px-4 py-2 text-sm text-white hover:bg-brand/90"
          >
            保存到本机
          </button>
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm text-ink/55 hover:text-ink">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
