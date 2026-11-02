export const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

export const ACCEPTED_DOCX_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : ({} as ImportMetaEnv);

export const ISLE_CV_ORIGIN = viteEnv.VITE_ISLE_CV_ORIGIN ?? "https://isle-cv.hhtj.cn";

export const ISLE_PHOTO_ORIGIN = viteEnv.VITE_ISLE_PHOTO_ORIGIN ?? "https://isle-photo.hhtj.cn";

export const TEMPLATE_STORAGE_KEY = "isle-thesis-template-id";
export const CUSTOM_TEMPLATES_KEY = "isle-thesis-custom-templates";
export const AI_STORAGE_KEY = "isle-thesis-ai-config";
