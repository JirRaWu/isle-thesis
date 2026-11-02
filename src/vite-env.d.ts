/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ISLE_CV_ORIGIN?: string;
  readonly VITE_ISLE_PHOTO_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
