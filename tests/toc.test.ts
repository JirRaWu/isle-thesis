import assert from "node:assert/strict";
import { test } from "node:test";
import { checkToc } from "../src/lib/check/toc.ts";
import { parseDocx } from "../src/lib/docx/parse.ts";
import { buildFixtureDocx } from "./fixtures/build-docx.ts";

test("flags TOC mismatches against outline headings", async () => {
  const blob = await buildFixtureDocx({
    paragraphs: [
      { text: "目录" },
      { text: "1 绪论 ........................ 1" },
      { text: "2 相关工作 .................... 3" },
      { text: "1 绪论", style: "Heading1" },
      { text: "绪论正文需要足够长度才会被当作正文抽样。" },
      { text: "2 系统设计", style: "Heading1" },
      { text: "系统设计章节正文也需要足够的字符数量。" },
      { text: "3 实验分析", style: "Heading1" },
      { text: "实验分析章节用来制造目录缺失项。" },
    ],
  });
  const model = await parseDocx(blob, "toc.docx");
  const issues = checkToc(model);
  assert.ok(issues.some((i) => i.category === "toc"));
});
