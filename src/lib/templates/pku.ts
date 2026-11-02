import type { ThesisTemplate } from "../../types/thesis";
import { GENERIC_GB } from "./generic-gb";

/** Peking University–flavoured rules (approximation). */
export const PKU: ThesisTemplate = {
  ...GENERIC_GB,
  id: "pku",
  name: "北京大学 · 本科论文（参考）",
  shortName: "北大",
  description: "参考北大常见要求：A4、左右约 2.5–3 cm、正文小四、固定行距常见为 20 磅近似 1.5 倍。",
  disclaimer: "非正式官方模板，细则以北京大学教务部最新规范为准。",
  margins: { top: 25, bottom: 25, left: 30, right: 25, toleranceMm: 2.5 },
  body: {
    ...GENERIC_GB.body,
    lineSpacing: { multiple: 1.5, tolerance: 0.12 },
  },
};
