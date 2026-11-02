import JSZip from "jszip";
import { A4_HEIGHT_TWIP, A4_WIDTH_TWIP } from "./units";
import type { DocModel, DocParagraph, PageBox, ResolvedRun } from "./model";
import { mergeParagraph, mergeRun, readParagraphProps, readRunProps } from "./props";
import { detectOutlineLevel, parseStylesXml, resolveStyle, type StylesBundle } from "./styles";
import { collectText, parseXml, wChild, wChildren, wIntAttr } from "./xml";

const MAX_DOCX_BYTES = 40 * 1024 * 1024;

async function readZipText(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path);
  if (!file) return null;
  return file.async("text");
}

function readPageBox(documentXml: string): PageBox {
  const doc = parseXml(documentXml);
  const body = wChild(doc.documentElement, "body");
  const fallback: PageBox = {
    widthTwip: A4_WIDTH_TWIP,
    heightTwip: A4_HEIGHT_TWIP,
    topTwip: 1440,
    bottomTwip: 1440,
    leftTwip: 1800,
    rightTwip: 1800,
  };
  if (!body) return fallback;

  // Prefer the last sectPr (document final section); also check paragraph-embedded ones.
  let sectPr = wChild(body, "sectPr");
  for (const p of wChildren(body, "p")) {
    const embedded = wChild(wChild(p, "pPr") ?? p, "sectPr");
    if (embedded) sectPr = embedded;
  }
  if (!sectPr) return fallback;

  const pgSz = wChild(sectPr, "pgSz");
  const pgMar = wChild(sectPr, "pgMar");
  return {
    widthTwip: wIntAttr(pgSz, "w") ?? fallback.widthTwip,
    heightTwip: wIntAttr(pgSz, "h") ?? fallback.heightTwip,
    topTwip: wIntAttr(pgMar, "top") ?? fallback.topTwip,
    bottomTwip: wIntAttr(pgMar, "bottom") ?? fallback.bottomTwip,
    leftTwip: wIntAttr(pgMar, "left") ?? fallback.leftTwip,
    rightTwip: wIntAttr(pgMar, "right") ?? fallback.rightTwip,
    headerTwip: wIntAttr(pgMar, "header"),
    footerTwip: wIntAttr(pgMar, "footer"),
  };
}

function readParagraphs(documentXml: string, bundle: StylesBundle): DocParagraph[] {
  const doc = parseXml(documentXml);
  const body = wChild(doc.documentElement, "body");
  if (!body) return [];

  const paragraphs: DocParagraph[] = [];
  let index = 0;

  for (const p of wChildren(body, "p")) {
    const pPrEl = wChild(p, "pPr");
    const directP = readParagraphProps(pPrEl);
    const styled = resolveStyle(directP.styleId, bundle);
    const mergedP = mergeParagraph(styled.paragraph, directP);

    const runs: ResolvedRun[] = [];
    for (const r of wChildren(p, "r")) {
      const text = collectText(r);
      if (!text) continue;
      const directR = readRunProps(wChild(r, "rPr"));
      runs.push({ text, ...mergeRun(styled.run, directR) });
    }

    // Hyperlinks wrap runs
    for (const hyper of wChildren(p, "hyperlink")) {
      for (const r of wChildren(hyper, "r")) {
        const text = collectText(r);
        if (!text) continue;
        const directR = readRunProps(wChild(r, "rPr"));
        runs.push({ text, ...mergeRun(styled.run, directR) });
      }
    }

    const text = runs.map((run) => run.text).join("");
    const dominant = runs.reduce<ResolvedRun | null>((best, run) => {
      if (!best || run.text.length > best.text.length) return run;
      return best;
    }, null);
    const run = mergeRun(styled.run, dominant ?? {});

    const outlineLvl = detectOutlineLevel(mergedP.styleId, mergedP.outlineLvl, bundle);

    paragraphs.push({
      index,
      text,
      styleId: mergedP.styleId,
      outlineLvl,
      alignment: mergedP.alignment,
      indentFirstLineTwip: mergedP.indentFirstLineTwip,
      indentLeftTwip: mergedP.indentLeftTwip,
      spacingBeforeTwip: mergedP.spacingBeforeTwip,
      spacingAfterTwip: mergedP.spacingAfterTwip,
      line: mergedP.line,
      lineRule: mergedP.lineRule,
      run,
      runs,
      isEmpty: text.trim().length === 0,
    });
    index += 1;
  }

  return paragraphs;
}

export async function parseDocx(file: File | Blob, fileName = "document.docx"): Promise<DocModel> {
  if (file.size > MAX_DOCX_BYTES) {
    throw new Error(`文件过大（上限 ${MAX_DOCX_BYTES / 1024 / 1024} MB）`);
  }

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await readZipText(zip, "word/document.xml");
  if (!documentXml) throw new Error("不是有效的 Word 文档（缺少 word/document.xml）");

  const stylesXml = (await readZipText(zip, "word/styles.xml")) ?? `<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`;
  const bundle = parseStylesXml(stylesXml);
  const page = readPageBox(documentXml);
  const paragraphs = readParagraphs(documentXml, bundle);

  return {
    fileName,
    page,
    defaults: bundle.defaults,
    styles: bundle.styles,
    paragraphs,
  };
}
