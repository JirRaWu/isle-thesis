import JSZip from "jszip";
import type { HeadingLevelSpec, ThesisTemplate } from "../../types/thesis";
import { createW, ensureChild, replaceChildren, setWAttr, wLocalName } from "./dom-edit";
import { serializeXml } from "./serialize";
import { LINE_SINGLE, mmToTwip, ptToHalfPoint } from "./units";
import { collectText, parseXml, wAttr, wChild, wChildren } from "./xml";

export interface FixResult {
  blob: Blob;
  fileName: string;
  /** Human-readable list of applied fixes. */
  applied: string[];
}

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function firstFont(list: string[], fallback: string) {
  return list[0] || fallback;
}

function buildRFonts(doc: Document, eastAsia: string, ascii: string) {
  const el = createW(doc, "rFonts");
  setWAttr(el, "ascii", ascii);
  setWAttr(el, "hAnsi", ascii);
  setWAttr(el, "eastAsia", eastAsia);
  setWAttr(el, "cs", ascii);
  return el;
}

function buildSz(doc: Document, halfPoints: number) {
  const sz = createW(doc, "sz");
  setWAttr(sz, "val", halfPoints);
  const szCs = createW(doc, "szCs");
  setWAttr(szCs, "val", halfPoints);
  return [sz, szCs];
}

function buildSpacing(doc: Document, multiple: number) {
  const spacing = createW(doc, "spacing");
  setWAttr(spacing, "line", Math.round(multiple * LINE_SINGLE));
  setWAttr(spacing, "lineRule", "auto");
  return spacing;
}

function buildIndent(doc: Document, firstLineTwip: number) {
  const ind = createW(doc, "ind");
  setWAttr(ind, "firstLine", firstLineTwip);
  return ind;
}

function fixSectPr(sectPr: Element, doc: Document, template: ThesisTemplate, applied: string[]) {
  const pgSz = ensureChild(sectPr, doc, "pgSz");
  setWAttr(pgSz, "w", mmToTwip(template.page.width));
  setWAttr(pgSz, "h", mmToTwip(template.page.height));

  const pgMar = ensureChild(sectPr, doc, "pgMar");
  setWAttr(pgMar, "top", mmToTwip(template.margins.top));
  setWAttr(pgMar, "bottom", mmToTwip(template.margins.bottom));
  setWAttr(pgMar, "left", mmToTwip(template.margins.left));
  setWAttr(pgMar, "right", mmToTwip(template.margins.right));
  if (!wAttr(pgMar, "header")) setWAttr(pgMar, "header", 720);
  if (!wAttr(pgMar, "footer")) setWAttr(pgMar, "footer", 720);

  if (!applied.includes("page-margins")) {
    applied.push("page-margins");
  }
}

function upsertParagraphStyle(
  stylesRoot: Element,
  doc: Document,
  styleId: string,
  name: string,
  outlineLvl: number | undefined,
  eastAsia: string,
  ascii: string,
  sizeHalf: number,
  bold: boolean | undefined,
  lineMultiple: number | undefined,
  firstLineTwip: number | undefined,
) {
  let styleEl =
    wChildren(stylesRoot, "style").find((el) => wAttr(el, "styleId") === styleId) ?? null;
  if (!styleEl) {
    styleEl = createW(doc, "style");
    setWAttr(styleEl, "type", "paragraph");
    setWAttr(styleEl, "styleId", styleId);
    stylesRoot.appendChild(styleEl);
  }

  let nameEl = wChild(styleEl, "name");
  if (!nameEl) {
    nameEl = createW(doc, "name");
    styleEl.insertBefore(nameEl, styleEl.firstChild);
  }
  setWAttr(nameEl, "val", name);

  const pPr = ensureChild(styleEl, doc, "pPr");
  if (outlineLvl != null) {
    const outline = ensureChild(pPr, doc, "outlineLvl");
    setWAttr(outline, "val", outlineLvl);
  }
  if (lineMultiple != null) {
    const spacing = ensureChild(pPr, doc, "spacing");
    setWAttr(spacing, "line", Math.round(lineMultiple * LINE_SINGLE));
    setWAttr(spacing, "lineRule", "auto");
  }
  if (firstLineTwip != null) {
    const ind = ensureChild(pPr, doc, "ind");
    setWAttr(ind, "firstLine", firstLineTwip);
  }

  const rPr = ensureChild(styleEl, doc, "rPr");
  // Rebuild font/size/bold children for predictability
  const keep = Array.from(rPr.children).filter((el) => !["rFonts", "sz", "szCs", "b"].includes(wLocalName(el)));
  replaceChildren(rPr, [...keep, buildRFonts(doc, eastAsia, ascii), ...buildSz(doc, sizeHalf)]);
  if (bold) {
    rPr.appendChild(createW(doc, "b"));
  }
}

function fixStylesXml(stylesXml: string, template: ThesisTemplate, applied: string[]): string {
  const doc = parseXml(stylesXml);
  const root = doc.documentElement;
  const bodyEast = firstFont(template.body.fonts.eastAsia, "宋体");
  const bodyAscii = firstFont(template.body.fonts.ascii, "Times New Roman");
  const bodyHalf = ptToHalfPoint(template.body.size.pt);
  const firstLineTwip =
    template.body.firstLineIndentChars != null
      ? Math.round(((template.body.size.pt * template.body.firstLineIndentChars) / 72) * 1440)
      : undefined;

  // docDefaults
  const docDefaults = ensureChild(root, doc, "docDefaults");
  const rPrDefault = ensureChild(docDefaults, doc, "rPrDefault");
  const rPr = ensureChild(rPrDefault, doc, "rPr");
  replaceChildren(rPr, [buildRFonts(doc, bodyEast, bodyAscii), ...buildSz(doc, bodyHalf)]);

  const pPrDefault = ensureChild(docDefaults, doc, "pPrDefault");
  const pPr = ensureChild(pPrDefault, doc, "pPr");
  replaceChildren(pPr, [
    buildSpacing(doc, template.body.lineSpacing.multiple),
    ...(firstLineTwip != null ? [buildIndent(doc, firstLineTwip)] : []),
  ]);
  applied.push("body-defaults");

  upsertParagraphStyle(
    root,
    doc,
    "Normal",
    "Normal",
    undefined,
    bodyEast,
    bodyAscii,
    bodyHalf,
    false,
    template.body.lineSpacing.multiple,
    firstLineTwip,
  );
  applied.push("normal-style");

  for (const heading of template.headings) {
    const styleId = `Heading${heading.level}`;
    const name = `heading ${heading.level}`;
    upsertParagraphStyle(
      root,
      doc,
      styleId,
      name,
      heading.level - 1,
      firstFont(heading.fonts.eastAsia, "黑体"),
      firstFont(heading.fonts.ascii, "Times New Roman"),
      ptToHalfPoint(heading.size.pt),
      heading.bold ?? true,
      heading.lineSpacing?.multiple,
      undefined,
    );
  }
  applied.push("heading-styles");

  return serializeXml(doc);
}

function headingForOutline(template: ThesisTemplate, outlineLvl: number): HeadingLevelSpec | undefined {
  return template.headings.find((h) => h.level - 1 === outlineLvl);
}

function applyRunProps(rPr: Element, doc: Document, eastAsia: string, ascii: string, sizeHalf: number, bold?: boolean) {
  const keep = Array.from(rPr.children).filter((el) => !["rFonts", "sz", "szCs", "b"].includes(wLocalName(el)));
  const next = [...keep, buildRFonts(doc, eastAsia, ascii), ...buildSz(doc, sizeHalf)];
  replaceChildren(rPr, next);
  if (bold) rPr.appendChild(createW(doc, "b"));
}

function fixDocumentXml(documentXml: string, template: ThesisTemplate, applied: string[]): string {
  const doc = parseXml(documentXml);
  const body = wChild(doc.documentElement, "body");
  if (!body) return documentXml;

  const bodyEast = firstFont(template.body.fonts.eastAsia, "宋体");
  const bodyAscii = firstFont(template.body.fonts.ascii, "Times New Roman");
  const bodyHalf = ptToHalfPoint(template.body.size.pt);
  const firstLineTwip =
    template.body.firstLineIndentChars != null
      ? Math.round(((template.body.size.pt * template.body.firstLineIndentChars) / 72) * 1440)
      : undefined;

  // Fix every sectPr (final + paragraph-embedded)
  for (const p of wChildren(body, "p")) {
    const embedded = wChild(wChild(p, "pPr") ?? p, "sectPr");
    if (embedded) fixSectPr(embedded, doc, template, applied);
  }
  const finalSect = wChild(body, "sectPr");
  if (finalSect) fixSectPr(finalSect, doc, template, applied);

  let bodyTouched = false;
  let headingTouched = false;
  let emptyCollapsed = 0;
  let emptyRun = 0;

  const paragraphs = wChildren(body, "p");
  for (const p of paragraphs) {
    const pPr = ensureChild(p, doc, "pPr");
    const styleId = wAttr(wChild(pPr, "pStyle"), "val");
    const outlineAttr = wIntOrUndef(wChild(pPr, "outlineLvl"));
    const isHeadingStyle = !!styleId && /^Heading\s*[123]$/i.test(styleId);
    const outlineLvl =
      outlineAttr ??
      (isHeadingStyle ? Number(styleId!.replace(/\D/g, "")) - 1 : undefined);

    const text = collectText(p).trim();
    const isEmpty = text.length === 0;

    if (isEmpty) {
      emptyRun += 1;
      if (emptyRun > 1) {
        // Mark for removal by setting a data flag — collect later
        p.setAttribute("data-isle-drop", "1");
        emptyCollapsed += 1;
      }
      continue;
    }
    emptyRun = 0;

    if (outlineLvl != null && outlineLvl <= 2) {
      const spec = headingForOutline(template, outlineLvl);
      if (spec) {
        let pStyle = wChild(pPr, "pStyle");
        if (!pStyle) {
          pStyle = createW(doc, "pStyle");
          pPr.insertBefore(pStyle, pPr.firstChild);
        }
        setWAttr(pStyle, "val", `Heading${spec.level}`);
        const outline = ensureChild(pPr, doc, "outlineLvl");
        setWAttr(outline, "val", spec.level - 1);

        for (const r of wChildren(p, "r")) {
          const rPr = ensureChild(r, doc, "rPr");
          applyRunProps(
            rPr,
            doc,
            firstFont(spec.fonts.eastAsia, "黑体"),
            firstFont(spec.fonts.ascii, "Times New Roman"),
            ptToHalfPoint(spec.size.pt),
            spec.bold ?? true,
          );
        }
        headingTouched = true;
      }
      continue;
    }

    // Body paragraph: force Normal + template typography
    let pStyle = wChild(pPr, "pStyle");
    if (!pStyle) {
      pStyle = createW(doc, "pStyle");
      pPr.insertBefore(pStyle, pPr.firstChild);
    }
    setWAttr(pStyle, "val", "Normal");

    const spacing = ensureChild(pPr, doc, "spacing");
    setWAttr(spacing, "line", Math.round(template.body.lineSpacing.multiple * LINE_SINGLE));
    setWAttr(spacing, "lineRule", "auto");
    if (firstLineTwip != null && text.length >= 8) {
      const ind = ensureChild(pPr, doc, "ind");
      setWAttr(ind, "firstLine", firstLineTwip);
    }

    for (const r of wChildren(p, "r")) {
      const rPr = ensureChild(r, doc, "rPr");
      applyRunProps(rPr, doc, bodyEast, bodyAscii, bodyHalf, false);
    }
    // hyperlink-wrapped runs
    for (const hyper of wChildren(p, "hyperlink")) {
      for (const r of wChildren(hyper, "r")) {
        const rPr = ensureChild(r, doc, "rPr");
        applyRunProps(rPr, doc, bodyEast, bodyAscii, bodyHalf, false);
      }
    }
    bodyTouched = true;
  }

  if (emptyCollapsed > 0) {
    for (const p of Array.from(paragraphs)) {
      if (p.getAttribute("data-isle-drop") === "1") {
        body.removeChild(p);
      }
    }
    applied.push("collapse-empty");
  }
  if (bodyTouched) applied.push("body-direct");
  if (headingTouched) applied.push("heading-direct");

  return serializeXml(doc);
}

function wIntOrUndef(el: Element | null): number | undefined {
  if (!el) return undefined;
  const raw = wAttr(el, "val");
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const APPLIED_LABELS: Record<string, string> = {
  "page-margins": "纸张与页边距",
  "body-defaults": "文档默认正文字体/行距",
  "normal-style": "「正文」样式",
  "heading-styles": "标题 1–3 样式",
  "body-direct": "正文直接格式",
  "heading-direct": "标题直接格式",
  "collapse-empty": "多余多余空段",
};

export function describeApplied(applied: string[]) {
  return applied.map((id) => APPLIED_LABELS[id] ?? id);
}

/** Rewrite OOXML so page/margins/styles/body/heading match the template; returns a new .docx blob. */
export async function fixDocx(
  source: ArrayBuffer | Blob,
  template: ThesisTemplate,
  originalName = "thesis.docx",
): Promise<FixResult> {
  const buffer = source instanceof Blob ? await source.arrayBuffer() : source;
  const zip = await JSZip.loadAsync(buffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) throw new Error("不是有效的 Word 文档（缺少 word/document.xml）");

  const applied: string[] = [];
  const documentXml = await documentFile.async("text");
  const stylesFile = zip.file("word/styles.xml");
  const stylesXml =
    (stylesFile ? await stylesFile.async("text") : null) ??
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="${W_NS}"/>`;

  const nextStyles = fixStylesXml(stylesXml, template, applied);
  const nextDocument = fixDocumentXml(documentXml, template, applied);

  zip.file("word/styles.xml", nextStyles);
  zip.file("word/document.xml", nextDocument);

  const blob = await zip.generateAsync({ type: "blob" });
  const base = originalName.replace(/\.docx$/i, "") || "thesis";
  return {
    blob,
    fileName: `${base}-已修复.docx`,
    applied: [...new Set(applied)],
  };
}
