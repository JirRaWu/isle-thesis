import type { ThesisTemplate } from "../../types/thesis";
import { GENERIC_GB } from "./generic-gb";

/** Tsinghua-flavoured rules (approximation). */
export const THU: ThesisTemplate = {
  ...GENERIC_GB,
  id: "thu",
  name: "清华大学 · 本科论文（参考）",
  shortName: "清华",
  description: "参考清华常见排版习惯：正文小四宋体、一级标题三号黑体。",
  disclaimer: "非正式官方模板，细则以清华大学教务处最新规范为准。",
  margins: { top: 25.4, bottom: 25.4, left: 31.8, right: 31.8, toleranceMm: 2.5 },
  headings: [
    {
      level: 1,
      fonts: { eastAsia: ["黑体", "SimHei"], ascii: ["Times New Roman"] },
      size: { pt: 16, tolerancePt: 1 },
      bold: true,
    },
    {
      level: 2,
      fonts: { eastAsia: ["黑体", "SimHei"], ascii: ["Times New Roman"] },
      size: { pt: 14, tolerancePt: 1 },
      bold: true,
    },
    {
      level: 3,
      fonts: { eastAsia: ["黑体", "SimHei", "宋体", "SimSun"], ascii: ["Times New Roman"] },
      size: { pt: 12, tolerancePt: 0.5 },
      bold: true,
    },
  ],
};
