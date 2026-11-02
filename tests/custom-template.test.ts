import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createRecordFromTemplate,
  materializeCustom,
} from "../src/lib/templates/custom.ts";
import { GENERIC_GB } from "../src/lib/templates/generic-gb.ts";

test("materializeCustom overlays margins and body fonts onto the base template", () => {
  const record = createRecordFromTemplate(GENERIC_GB, "我院规范");
  record.margins.left = 28;
  record.body.eastAsia = "仿宋";
  record.body.sizePt = 12;
  record.headings[0]!.sizePt = 18;

  // crypto.randomUUID may exist in Node; ensure id shape
  assert.match(record.id, /^custom-/);

  const tpl = materializeCustom(record);
  assert.equal(tpl.shortName, "我院规范");
  assert.equal(tpl.margins.left, 28);
  assert.equal(tpl.body.fonts.eastAsia[0], "仿宋");
  assert.ok(tpl.body.fonts.eastAsia.includes("宋体"));
  assert.equal(tpl.headings[0]!.size.pt, 18);
  assert.ok(tpl.structure.length >= GENERIC_GB.structure.length);
});
