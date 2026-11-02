export const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

export const ACCEPTED_DOCX_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ISLE_CV_ORIGIN =
  (import.meta.env.VITE_ISLE_CV_ORIGIN as string | undefined) ?? "https://isle-cv.hhtj.cn";

export const ISLE_PHOTO_ORIGIN =
  (import.meta.env.VITE_ISLE_PHOTO_ORIGIN as string | undefined) ?? "https://isle-photo.hhtj.cn";

export const TEMPLATE_STORAGE_KEY = "isle-thesis-template-id";
export const AI_STORAGE_KEY = "isle-thesis-ai-config";
