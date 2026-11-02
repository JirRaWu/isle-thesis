import { useCallback, useRef, useState } from "react";
import { ACCEPTED_DOCX_TYPES, MAX_UPLOAD_BYTES } from "@/config/constants";

interface UploadDropzoneProps {
  disabled?: boolean;
  onFile: (file: File) => void;
}

export function UploadDropzone({ disabled, onFile }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const acceptFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setLocalError(null);
      const isDocx =
        file.name.toLowerCase().endsWith(".docx") ||
        (ACCEPTED_DOCX_TYPES as readonly string[]).includes(file.type);
      if (!isDocx) {
        setLocalError("只支持 .docx（Word 2007 及以后）。旧版 .doc 请先另存为 .docx。");
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setLocalError(`文件过大，上限 ${MAX_UPLOAD_BYTES / 1024 / 1024} MB。`);
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        acceptFile(e.dataTransfer.files?.[0]);
      }}
      className={[
        "group relative flex min-h-[168px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center transition",
        dragOver ? "border-brand bg-brand/8" : "border-brand/25 bg-white/55 hover:border-brand/50 hover:bg-white/75",
        disabled ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        disabled={disabled}
        onChange={(e) => acceptFile(e.target.files?.[0])}
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand transition group-hover:scale-105">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">拖入或选择 .docx 论文</p>
        <p className="text-xs text-ink/50">解析与检查全程在本机完成，不会上传文档</p>
      </div>
      {localError && <p className="text-xs text-danger">{localError}</p>}
    </div>
  );
}
