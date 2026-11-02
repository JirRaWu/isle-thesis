import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ThesisStudio } from "@/components/studio/ThesisStudio";

export function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(165deg,#d9eef8_0%,#f2f6f9_40%,#e4f0f7_72%,#d5eaf5_100%)]" />
        <div className="animate-drift absolute -left-24 top-[-8%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,#4cbcf045,transparent_68%)] blur-2xl" />
        <div
          className="animate-drift absolute -right-16 top-[22%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,#0369a028,transparent_70%)] blur-2xl"
          style={{ animationDelay: "-6s" }}
        />
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(3,105,160,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(3,105,160,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_28%,transparent_78%)]" />
      </div>

      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-6 pt-1 md:px-8 md:pt-3">
        <section className="animate-rise mb-6 max-w-3xl space-y-3 md:mb-8 md:space-y-4">
          <h1 className="font-display text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-ink md:text-6xl">
            简屿 · 论文
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-ink/65 md:text-lg">
            本机检查毕业论文 Word 格式。文档不上传服务器，规则可对照学院模板。
          </p>
        </section>

        <ThesisStudio />
      </main>

      <SiteFooter />
    </div>
  );
}
