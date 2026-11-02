import assert from "node:assert/strict";
import { test } from "node:test";
import { runChecks } from "../src/lib/check/run.ts";
import { parseDocx } from "../src/lib/docx/parse.ts";
import { GENERIC_GB } from "../src/lib/templates/generic-gb.ts";
import { buildFixtureDocx } from "./fixtures/build-docx.ts";

test("flags wrong margins and missing structure on a sparse document", async () => {
  const blob = await buildFixtureDocx({
    margins: { top: 720, bottom: 720, left: 720, right: 720 },
    paragraphs: [
      {
        text: "随便写一点很长的正文用来触发字体检查逻辑，内容需要超过八个字才算正文。",
        eastAsia: "微软雅黑",
        ascii: "Arial",
        sizeHalfPoints: 32,
        line: 240,
        lineRule: "auto",
      },
    ],
  });

  const model = await parseDocx(blob, "bad.docx");
  const report = runChecks(model, GENERIC_GB);

  assert.ok(report.summary.errors >= 1);
  assert.ok(report.issues.some((i) => i.category === "margin"));
  assert.ok(report.issues.some((i) => i.category === "structure" && i.title.includes("摘要")));
  assert.ok(report.issues.some((i) => i.category === "structure" && i.title.includes("参考文献")));
  assert.ok(report.summary.score < 100);
});

test("a well-formed minimal thesis scores higher and keeps abstract/references", async () => {
  const blob = await buildFixtureDocx({
    margins: { top: 1418, bottom: 1418, left: 1701, right: 1418 },
    paragraphs: [
      { text: "摘要", style: "Heading1" },
      {
        text: "本文研究了本地论文格式检查工具在浏览器中的可行性，并给出了实现路径与评估结果。",
        eastAsia: "宋体",
        ascii: "Times New Roman",
        sizeHalfPoints: 24,
        firstLineTwip: 480,
        line: 360,
      },
      { text: "关键词：格式检查；毕业论文；本地解析" },
      { text: "Abstract", style: "Heading1" },
      {
        text: "This paper studies a local thesis format checker running entirely in the browser.",
        eastAsia: "宋体",
        ascii: "Times New Roman",
        sizeHalfPoints: 24,
        line: 360,
      },
      { text: "1 绪论", style: "Heading1" },
      {
        text: "毕业论文排版耗费大量时间，自动化检查可以显著降低重复劳动并提高规范性。",
        eastAsia: "宋体",
        ascii: "Times New Roman",
        sizeHalfPoints: 24,
        firstLineTwip: 480,
        line: 360,
      },
      { text: "参考文献", style: "Heading1" },
      { text: "[1] 张三. 排版规范研究[J]. 示例学报, 2024." },
    ],
  });

  const model = await parseDocx(blob, "good.docx");
  const report = runChecks(model, GENERIC_GB);
  assert.ok(!report.issues.some((i) => i.title.includes("未找到「中文摘要」")));
  assert.ok(!report.issues.some((i) => i.title.includes("未找到「参考文献」")));
  assert.ok(report.summary.score >= 70);
});

test("heading skip is reported when outline jumps 0 → 2", async () => {
  const blob = await buildFixtureDocx({
    paragraphs: [
      { text: "摘要" },
      { text: "参考文献" },
      { text: "第一章 绪论", outlineLvl: 0, eastAsia: "黑体", sizeHalfPoints: 32, bold: true },
      { text: "1.1.1 细节", outlineLvl: 2, eastAsia: "黑体", sizeHalfPoints: 24, bold: true },
      {
        text: "这是用于满足正文抽样阈值的足够长的一段说明文字，避免结构检查之外没有其它数据。",
        eastAsia: "宋体",
        ascii: "Times New Roman",
        sizeHalfPoints: 24,
        line: 360,
        firstLineTwip: 480,
      },
    ],
  });
  const model = await parseDocx(blob, "skip2.docx");
  const report = runChecks(model, GENERIC_GB);
  assert.ok(report.issues.some((i) => i.title.includes("标题层级跳级")));
});
