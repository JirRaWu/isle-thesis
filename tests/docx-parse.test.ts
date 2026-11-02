import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDocx } from "../src/lib/docx/parse.ts";
import { twipToMm } from "../src/lib/docx/units.ts";
import { buildFixtureDocx } from "./fixtures/build-docx.ts";

test("parses page size, margins, styles and paragraph text from a minimal docx", async () => {
  const blob = await buildFixtureDocx({
    margins: { top: 1418, bottom: 1418, left: 1701, right: 1418 },
    paragraphs: [
      { text: "摘要", style: "Heading1" },
      {
        text: "这是一段正文内容，用来验证字体字号与行距解析。",
        eastAsia: "宋体",
        ascii: "Times New Roman",
        sizeHalfPoints: 24,
        firstLineTwip: 480,
        line: 360,
        lineRule: "auto",
      },
      { text: "第一章 绪论", style: "Heading1" },
    ],
  });

  const model = await parseDocx(blob, "sample.docx");
  assert.equal(model.fileName, "sample.docx");
  assert.ok(Math.abs(twipToMm(model.page.widthTwip) - 210) < 1);
  assert.ok(Math.abs(twipToMm(model.page.leftTwip) - 30) < 1);
  assert.equal(model.paragraphs.length, 3);
  assert.equal(model.paragraphs[0]!.text, "摘要");
  assert.equal(model.paragraphs[0]!.outlineLvl, 0);
  assert.equal(model.paragraphs[1]!.run.eastAsiaFont, "宋体");
  assert.equal(model.paragraphs[1]!.run.sizeHalfPoints, 24);
  assert.equal(model.paragraphs[1]!.line, 360);
});
