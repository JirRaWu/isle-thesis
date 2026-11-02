/**
 * Generate a Chinese undergraduate-style sample thesis (.docx)
 * with intentional format problems for Isle Thesis demos.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(root, "../samples");
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function para({
  text = "",
  style,
  eastAsia,
  ascii,
  size,
  bold,
  firstLine,
  line,
  lineRule = "auto",
  outlineLvl,
  align,
}) {
  const pPr = [];
  if (style) pPr.push(`<w:pStyle w:val="${style}"/>`);
  if (outlineLvl != null) pPr.push(`<w:outlineLvl w:val="${outlineLvl}"/>`);
  if (align) pPr.push(`<w:jc w:val="${align}"/>`);
  if (firstLine != null) pPr.push(`<w:ind w:firstLine="${firstLine}"/>`);
  if (line != null) pPr.push(`<w:spacing w:line="${line}" w:lineRule="${lineRule}"/>`);
  const rPr = [];
  if (eastAsia || ascii) {
    rPr.push(
      `<w:rFonts w:ascii="${ascii ?? "Times New Roman"}" w:hAnsi="${ascii ?? "Times New Roman"}" w:eastAsia="${eastAsia ?? "宋体"}"/>`,
    );
  }
  if (size != null) rPr.push(`<w:sz w:val="${size}"/>`);
  if (bold) rPr.push(`<w:b/>`);
  return `<w:p>${pPr.length ? `<w:pPr>${pPr.join("")}</w:pPr>` : ""}${
    text
      ? `<w:r>${rPr.length ? `<w:rPr>${rPr.join("")}</w:rPr>` : ""}<w:t xml:space="preserve">${escape(text)}</w:t></w:r>`
      : ""
  }</w:p>`;
}

const body = [
  // Cover-ish title (oversized, wrong font on purpose)
  para({
    text: "基于浏览器的毕业论文格式自动检查系统设计与实现",
    eastAsia: "微软雅黑",
    ascii: "Arial",
    size: 44,
    bold: true,
    align: "center",
  }),
  para({ text: "本科毕业论文", eastAsia: "楷体", size: 32, align: "center" }),
  para({ text: "学院：计算机科学与技术学院", eastAsia: "宋体", size: 24, align: "center" }),
  para({ text: "专业：软件工程　　姓名：李明　　学号：20210001", eastAsia: "宋体", size: 24, align: "center" }),
  para({}),
  para({}),
  para({}),

  para({ text: "摘要", style: "Heading1" }),
  para({
    text: "毕业论文排版规范琐碎且容易出错，学生往往花费大量时间在字体、行距与页边距调整上。本文设计并实现了一套运行于浏览器的本地格式检查工具，通过解析 Word OOXML，对照常见高校模板输出分级问题清单。系统无需上传文档，可在保护隐私的前提下完成自查。实验表明，该方法能够有效发现页边距、正文字体字号、标题层级与结构缺失等问题。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),
  // Wrong: keywords line uses YaHei and no standard prefix spacing
  para({
    text: "关键词：格式检查；毕业论文；OOXML；本地解析",
    eastAsia: "微软雅黑",
    ascii: "Arial",
    size: 24,
    line: 240,
  }),

  para({ text: "Abstract", style: "Heading1" }),
  para({
    text: "Thesis formatting rules are tedious and error-prone. This paper presents a browser-based local checker that parses Word OOXML and reports graded issues against common university templates without uploading documents.",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),
  para({
    text: "Keywords: format checking; thesis; OOXML; local parsing",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    line: 360,
  }),

  para({ text: "目录", style: "Heading1" }),
  para({ text: "1 绪论 ................................ 1", eastAsia: "宋体", size: 24, line: 360 }),
  para({ text: "2 相关工作 ............................ 3", eastAsia: "宋体", size: 24, line: 360 }),
  para({ text: "3 系统设计 ............................ 5", eastAsia: "宋体", size: 24, line: 360 }),
  para({ text: "4 实验与分析 .......................... 8", eastAsia: "宋体", size: 24, line: 360 }),
  para({ text: "5 总结与展望 .......................... 10", eastAsia: "宋体", size: 24, line: 360 }),
  para({ text: "参考文献 .............................. 11", eastAsia: "宋体", size: 24, line: 360 }),
  para({ text: "致谢 .................................. 12", eastAsia: "宋体", size: 24, line: 360 }),

  para({ text: "1 绪论", style: "Heading1" }),
  // Intentional heading skip: jump to level 3
  para({
    text: "1.1.1 研究背景",
    outlineLvl: 2,
    eastAsia: "黑体",
    ascii: "Times New Roman",
    size: 24,
    bold: true,
  }),
  para({
    text: "随着高等教育规模扩大，毕业论文数量持续增长。各学院通常会发布《撰写规范》，对纸张、页边距、正文字体、标题层级、摘要与参考文献等提出明确要求。然而，人工逐项核对成本高，现有在线工具又常常要求上传全文，带来隐私与版权顾虑。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),
  // Wrong body: YaHei + 14pt + single spacing + no indent
  para({
    text: "因此，有必要提供一套本地运行、规则可配置、结果可解释的格式自查工具，帮助学生在提交前快速发现问题。如图1所示，整体流程包含上传、解析、对照模板与生成报告四个阶段。",
    eastAsia: "微软雅黑",
    ascii: "Arial",
    size: 28,
    line: 240,
  }),
  // Mentions figure but no formal caption → caption info issue
  para({
    text: "本文其余部分安排如下：第2章介绍相关工作；第3章给出系统设计；第4章进行实验分析；第5章总结全文。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),

  para({ text: "2 相关工作", style: "Heading1" }),
  para({ text: "2.1 文档解析技术", style: "Heading2" }),
  para({
    text: "Office Open XML 将 Word 文档组织为压缩包，其中 document.xml 保存段落与直接格式，styles.xml 保存样式定义与继承关系。浏览器端可使用 JSZip 解压，再结合 DOM 解析提取版式信息。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),
  para({ text: "2.2 格式检查系统", style: "Heading2" }),
  para({
    text: "传统检查多依赖 Word 宏或桌面软件，部署成本较高；云端 SaaS 则面临上传限制。本地 WASM / JavaScript 方案能够兼顾可用性与隐私。如表1所示，不同方案在隐私、可扩展性与成本上存在权衡。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),

  para({ text: "3 系统设计", style: "Heading1" }),
  para({ text: "3.1 总体架构", style: "Heading2" }),
  para({
    text: "系统采用前端单页应用架构：上传后的文件仅在内存中解析，检查结果以分级问题列表呈现，并支持导出 Markdown 报告。可选 AI 助手仅发送单条问题字段，用于白话解释，不上传整篇论文。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),
  para({ text: "3.2 规则模板", style: "Heading2" }),
  para({
    text: "模板以声明式结构描述纸张、页边距、正文与标题样式、必要结构标记等。内置通用国标及若干高校参考模板，用户可按学院要求切换。需要强调的是，参考模板并非官方文件，最终应以学院最新规范为准。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),

  // Too many empty paragraphs
  para({}),
  para({}),
  para({}),
  para({}),
  para({}),

  para({ text: "4 实验与分析", style: "Heading1" }),
  para({
    text: "我们构造了正确样本与故意违规样本，对页边距、字体、字号、行距、标题跳级与结构缺失等检查项进行验证。结果表明，规则引擎能够稳定识别主要违规类型，并对附近原文提供定位信息，便于对照修改。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),

  para({ text: "5 总结与展望", style: "Heading1" }),
  para({
    text: "本文实现了浏览器本地的毕业论文格式检查原型，覆盖常见排版规则并支持报告导出。后续工作包括自动回写修复、参考文献国标逐条校验，以及用户自定义模板编辑器。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),

  para({ text: "参考文献", style: "Heading1" }),
  para({
    text: "[1] 张三, 李四. 面向毕业论文的排版规范研究[J]. 高等教育研究, 2023, 44(2): 56-62.",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 21,
    line: 360,
  }),
  para({
    text: "[2] Wang L. Local document analysis in the browser[C]//Proceedings of WebTech. 2024: 101-110.",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 21,
    line: 360,
  }),
  para({
    text: "[3] 王五. Office Open XML 解析实践[M]. 北京: 示例出版社, 2022.",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 21,
    line: 360,
  }),

  para({ text: "致谢", style: "Heading1" }),
  para({
    text: "感谢导师在选题与写作过程中的指导，感谢同学在测试阶段提供的样本文档与反馈意见。",
    eastAsia: "宋体",
    ascii: "Times New Roman",
    size: 24,
    firstLine: 480,
    line: 360,
  }),
];

// Intentional wrong margins: ~20mm all sides (1134 twips) instead of 25/30
const margins = { top: 1134, bottom: 1134, left: 1134, right: 1134 };

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${W}>
  <w:docDefaults>
    <w:rPrDefault><w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="宋体"/>
      <w:sz w:val="24"/>
    </w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr>
      <w:spacing w:line="360" w:lineRule="auto"/>
    </w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="黑体"/><w:b/><w:sz w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="黑体"/><w:b/><w:sz w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
</w:styles>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${W}>
  <w:body>
    ${body.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="${margins.top}" w:right="${margins.right}" w:bottom="${margins.bottom}" w:left="${margins.left}" w:header="720" w:footer="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const zip = new JSZip();
zip.file("[Content_Types].xml", contentTypes);
zip.folder("_rels").file(".rels", rels);
const word = zip.folder("word");
word.file("document.xml", documentXml);
word.file("styles.xml", styles);
word.folder("_rels").file("document.xml.rels", docRels);

const buf = await zip.generateAsync({ type: "nodebuffer" });
await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, "测试论文-格式待查.docx");
await writeFile(outPath, buf);

const desktop = path.join(process.env.USERPROFILE || process.env.HOME || "", "Desktop", "测试论文-格式待查.docx");
try {
  await writeFile(desktop, buf);
  console.log(`wrote ${outPath}`);
  console.log(`wrote ${desktop}`);
} catch {
  console.log(`wrote ${outPath}`);
}
