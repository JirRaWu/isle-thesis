import { ISLE_CV_ORIGIN, ISLE_PHOTO_ORIGIN } from "@/config/constants";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 border-t border-brand/10 px-5 py-8 text-sm text-ink/45 md:flex-row md:items-center md:justify-between md:px-8">
      <p>简屿 · 论文 · 文档仅在本地解析</p>
      <nav className="flex flex-wrap gap-4">
        <a href={ISLE_CV_ORIGIN} className="transition-colors hover:text-brand" rel="noreferrer" target="_blank">
          简屿 · 简历
        </a>
        <a href={ISLE_PHOTO_ORIGIN} className="transition-colors hover:text-brand" rel="noreferrer" target="_blank">
          简屿 · 证件照
        </a>
        <a
          href="https://github.com/JirRaWu/isle-thesis"
          className="transition-colors hover:text-brand"
          rel="noreferrer"
          target="_blank"
        >
          开源仓库
        </a>
      </nav>
    </footer>
  );
}
