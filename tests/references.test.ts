import assert from "node:assert/strict";
import { test } from "node:test";
import { checkReferences } from "../src/lib/check/references.ts";
import { parseDocx } from "../src/lib/docx/parse.ts";
import { buildFixtureDocx } from "./fixtures/build-docx.ts";

test("flags duplicate and out-of-order reference numbers", async () => {
  const blob = await buildFixtureDocx({
    paragraphs: [
      { text: "摘要" },
      { text: "参考文献" },
      { text: "[1] 张三. 完整的期刊文章标题[J]. 示例学报, 2023, 12(3): 1-8." },
      { text: "[3] 跳号文献[J]. 某某刊, 2022." },
      { text: "[3] 重复序号[M]. 北京: 出版社, 2021." },
      { text: "致谢" },
    ],
  });
  const model = await parseDocx(blob, "refs.docx");
  const issues = checkReferences(model);
  assert.ok(issues.some((i) => i.title.includes("不连续")));
  assert.ok(issues.some((i) => i.title.includes("重复")));
});

test("accepts a tidy numbered reference list", async () => {
  const blob = await buildFixtureDocx({
    paragraphs: [
      { text: "参考文献" },
      { text: "[1] 张三. 排版规范研究[J]. 高等教育研究, 2023, 44(2): 56-62." },
      { text: "[2] 李四. Office 文档解析[M]. 北京: 示例出版社, 2022." },
    ],
  });
  const model = await parseDocx(blob, "ok-refs.docx");
  const issues = checkReferences(model);
  assert.equal(issues.filter((i) => i.severity === "error" || i.severity === "warning").length, 0);
});
