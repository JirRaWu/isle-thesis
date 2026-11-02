import { ISLE_CV_ORIGIN } from "@/config/constants";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
      <a
        href="/"
        className="font-display text-base font-semibold tracking-tight text-brand transition hover:text-brand/85 md:text-lg"
      >
        简屿 · 论文
      </a>
      <nav className="flex items-center gap-4 text-sm text-ink/60">
        <a href="#studio" className="transition-colors hover:text-brand">
          开始检查
        </a>
        <a href={ISLE_CV_ORIGIN} className="transition-colors hover:text-brand" rel="noreferrer" target="_blank">
          去做简历
        </a>
      </nav>
    </header>
  );
}
