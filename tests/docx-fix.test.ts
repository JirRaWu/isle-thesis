import assert from "node:assert/strict";
import { test } from "node:test";
import { runChecks } from "../src/lib/check/run.ts";
import { fixDocx } from "../src/lib/docx/fix.ts";
import { parseDocx } from "../src/lib/docx/parse.ts";
import { twipToMm } from "../src/lib/docx/units.ts";
import { GENERIC_GB } from "../src/lib/templates/generic-gb.ts";
import { buildFixtureDocx } from "./fixtures/build-docx.ts";

test("fixDocx corrects margins, body typography and improves the check score", async () => {
  const bad = await buildFixtureDocx({
    margins: { top: 720, bottom: 720, left: 720, right: 720 },
    paragraphs: [
      { text: "摘要", style: "Heading1" },
      {
        text: "这是一段故意用错字体字号和行距的正文，用来验证一键修复是否生效。",
        eastAsia: "微软雅黑",
        ascii: "Arial",
        sizeHalfPoints: 32,
        line: 240,
        lineRule: "auto",
      },
      { text: "参考文献", style: "Heading1" },
      { text: "[1] 测试文献。" },
      { text: "" },
      { text: "" },
      { text: "" },
      { text: "" },
      { text: "" },
    ],
  });

  const beforeModel = await parseDocx(bad, "bad.docx");
  const before = runChecks(beforeModel, GENERIC_GB);
  assert.ok(before.summary.errors >= 1);

  const fixed = await fixDocx(bad, GENERIC_GB, "bad.docx");
  assert.equal(fixed.fileName, "bad-已修复.docx");
  assert.ok(fixed.applied.includes("page-margins"));
  assert.ok(fixed.applied.includes("body-direct"));

  const afterModel = await parseDocx(fixed.blob, fixed.fileName);
  assert.ok(Math.abs(twipToMm(afterModel.page.topTwip) - GENERIC_GB.margins.top) < 1);
  assert.ok(Math.abs(twipToMm(afterModel.page.leftTwip) - GENERIC_GB.margins.left) < 1);

  const body = afterModel.paragraphs.find((p) => p.text.includes("故意用错"));
  assert.ok(body);
  assert.equal(body!.run.eastAsiaFont, "宋体");
  assert.equal(body!.run.sizeHalfPoints, 24);
  assert.equal(body!.line, 360);

  const after = runChecks(afterModel, GENERIC_GB);
  assert.ok(after.summary.score > before.summary.score);
  assert.ok(after.summary.errors < before.summary.errors);
});
