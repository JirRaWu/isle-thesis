import assert from "node:assert/strict";
import { test } from "node:test";
import { checkPagination } from "../src/lib/check/pagination.ts";
import { parseDocx } from "../src/lib/docx/parse.ts";
import { buildFixtureDocx } from "./fixtures/build-docx.ts";

test("reports missing header/footer/page fields on a bare document", async () => {
  const blob = await buildFixtureDocx({
    paragraphs: [{ text: "摘要" }, { text: "正文一段足够长的内容用来占位检查。" }, { text: "参考文献" }],
  });
  const model = await parseDocx(blob, "bare.docx");
  assert.equal(model.chrome.hasHeader, false);
  const issues = checkPagination(model);
  assert.ok(issues.some((i) => i.title.includes("页眉或页脚")));
});
