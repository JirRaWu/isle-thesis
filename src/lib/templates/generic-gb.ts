import type { ThesisTemplate } from "../../types/thesis";

/** Generic Chinese undergraduate thesis rules (common GB-style expectations). */
export const GENERIC_GB: ThesisTemplate = {
  id: "generic-gb",
  name: "通用本科毕业论文",
  shortName: "通用国标",
  description: "综合多数高校通用要求：A4、宋体小四、1.5 倍行距、标准页边距与三级标题。",
  disclaimer: "各校细则不同，本模板仅作通用参考，请以学院最新《撰写规范》为准。",
  page: { width: 210, height: 297, toleranceMm: 1 },
  margins: { top: 25, bottom: 25, left: 30, right: 25, toleranceMm: 2 },
  body: {
    fonts: {
      eastAsia: ["宋体", "SimSun", "NSimSun", "新宋体", "STSong"],
      ascii: ["Times New Roman", "Times"],
    },
    size: { pt: 12, tolerancePt: 0.5 },
    lineSpacing: { multiple: 1.5, tolerance: 0.08 },
    firstLineIndentChars: 2,
  },
  headings: [
    {
      level: 1,
      fonts: { eastAsia: ["黑体", "SimHei", "微软雅黑", "Microsoft YaHei"], ascii: ["Times New Roman", "Arial", "Helvetica"] },
      size: { pt: 16, tolerancePt: 1 },
      bold: true,
    },
    {
      level: 2,
      fonts: { eastAsia: ["黑体", "SimHei", "楷体", "KaiTi", "华文楷体"], ascii: ["Times New Roman", "Arial"] },
      size: { pt: 14, tolerancePt: 1 },
      bold: true,
    },
    {
      level: 3,
      fonts: { eastAsia: ["宋体", "SimSun", "黑体", "SimHei", "楷体", "KaiTi"], ascii: ["Times New Roman"] },
      size: { pt: 12, tolerancePt: 0.5 },
      bold: true,
    },
  ],
  structure: [
    { id: "abstract-zh", label: "中文摘要", patterns: [/^摘\s*要$/, /^中文摘要$/], severity: "error" },
    { id: "keywords-zh", label: "中文关键词", patterns: [/^关键词[：:].+/, /^关\s*键\s*词[：:].+/], severity: "warning" },
    { id: "abstract-en", label: "英文 Abstract", patterns: [/^Abstract$/i], severity: "warning" },
    { id: "keywords-en", label: "英文 Keywords", patterns: [/^Key\s*words?[：:\s].+/i], severity: "info" },
    { id: "toc", label: "目录", patterns: [/^目\s*录$/, /^Contents$/i], severity: "info" },
    { id: "references", label: "参考文献", patterns: [/^参考文献$/, /^References$/i], severity: "error" },
    { id: "ack", label: "致谢", patterns: [/^致\s*谢$/, /^Acknowledgements?$/i], severity: "info" },
  ],
  captions: [
    { id: "figure", label: "图题", patterns: [/^图\s*\d+([-—.．]\d+)?[　\s]+.+/] },
    { id: "table", label: "表题", patterns: [/^表\s*\d+([-—.．]\d+)?[　\s]+.+/] },
  ],
  maxConsecutiveEmpty: 4,
};
