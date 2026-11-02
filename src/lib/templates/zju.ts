import type { ThesisTemplate } from "../../types/thesis";
import { GENERIC_GB } from "./generic-gb";

/** Zhejiang University–flavoured undergraduate rules (approximation). */
export const ZJU: ThesisTemplate = {
  ...GENERIC_GB,
  id: "zju",
  name: "浙江大学 · 本科论文（参考）",
  shortName: "浙大",
  description: "参考浙大常见本科要求：页边距略紧、正文宋体小四、1.5 倍行距。",
  disclaimer: "非正式官方模板，细则以浙江大学本科生院最新规范为准。",
  margins: { top: 25, bottom: 25, left: 25, right: 25, toleranceMm: 2 },
};
