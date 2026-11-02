import JSZip from "jszip";

const W =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

export interface FixtureParagraph {
  text: string;
  style?: string;
  eastAsia?: string;
  ascii?: string;
  sizeHalfPoints?: number;
  bold?: boolean;
  firstLineTwip?: number;
  line?: number;
  lineRule?: string;
  outlineLvl?: number;
}

export interface FixtureDocOptions {
  widthTwip?: number;
  heightTwip?: number;
  margins?: { top: number; bottom: number; left: number; right: number };
  paragraphs: FixtureParagraph[];
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphXml(p: FixtureParagraph) {
  const pPrParts: string[] = [];
  if (p.style) pPrParts.push(`<w:pStyle w:val="${p.style}"/>`);
  if (p.outlineLvl != null) pPrParts.push(`<w:outlineLvl w:val="${p.outlineLvl}"/>`);
  if (p.firstLineTwip != null) pPrParts.push(`<w:ind w:firstLine="${p.firstLineTwip}"/>`);
  if (p.line != null) {
    pPrParts.push(
      `<w:spacing w:line="${p.line}" w:lineRule="${p.lineRule ?? "auto"}"/>`,
    );
  }
  const pPr = pPrParts.length ? `<w:pPr>${pPrParts.join("")}</w:pPr>` : "";

  const rPrParts: string[] = [];
  if (p.eastAsia || p.ascii) {
    rPrParts.push(
      `<w:rFonts w:ascii="${p.ascii ?? "Times New Roman"}" w:hAnsi="${p.ascii ?? "Times New Roman"}" w:eastAsia="${p.eastAsia ?? "宋体"}"/>`,
    );
  }
  if (p.sizeHalfPoints != null) rPrParts.push(`<w:sz w:val="${p.sizeHalfPoints}"/>`);
  if (p.bold) rPrParts.push(`<w:b/>`);
  const rPr = rPrParts.length ? `<w:rPr>${rPrParts.join("")}</w:rPr>` : "";

  return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(p.text)}</w:t></w:r></w:p>`;
}

export async function buildFixtureDocx(options: FixtureDocOptions): Promise<Blob> {
  const margins = options.margins ?? { top: 1440, bottom: 1440, left: 1701, right: 1418 };
  const width = options.widthTwip ?? 11906;
  const height = options.heightTwip ?? 16838;

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
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:eastAsia="黑体"/>
      <w:b/><w:sz w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:eastAsia="黑体"/>
      <w:b/><w:sz w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
</w:styles>`;

  const bodyParas = options.paragraphs.map(paragraphXml).join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${W}>
  <w:body>
    ${bodyParas}
    <w:sectPr>
      <w:pgSz w:w="${width}" w:h="${height}"/>
      <w:pgMar w:top="${margins.top}" w:right="${margins.right}" w:bottom="${margins.bottom}" w:left="${margins.left}" w:header="720" w:footer="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.folder("_rels")!.file(".rels", rels);
  const word = zip.folder("word")!;
  word.file("document.xml", documentXml);
  word.file("styles.xml", styles);
  word.folder("_rels")!.file("document.xml.rels", docRels);

  return zip.generateAsync({ type: "blob" });
}
