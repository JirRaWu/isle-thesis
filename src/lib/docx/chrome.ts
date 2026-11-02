import type JSZip from "jszip";
import type { DocChrome } from "./model";
import { collectText, parseXml, wChild, wChildren } from "./xml";

const REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const HEADER_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header";
const FOOTER_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer";

function hasPageField(xml: string) {
  return /\bPAGE\b/i.test(xml);
}

export async function parseChrome(zip: JSZip, documentXml: string): Promise<DocChrome> {
  const parts: DocChrome["parts"] = [];
  const relsXml = await zip.file("word/_rels/document.xml.rels")?.async("text");
  if (relsXml) {
    const relsDoc = parseXml(relsXml);
    const relationships = Array.from(relsDoc.getElementsByTagNameNS(REL_NS, "Relationship")).length
      ? Array.from(relsDoc.getElementsByTagNameNS(REL_NS, "Relationship"))
      : Array.from(relsDoc.getElementsByTagName("Relationship"));

    for (const rel of relationships) {
      const type = rel.getAttribute("Type") ?? "";
      const target = rel.getAttribute("Target") ?? "";
      if (!target) continue;
      const kind = type === HEADER_TYPE ? "header" : type === FOOTER_TYPE ? "footer" : null;
      if (!kind) continue;
      const path = target.startsWith("/")
        ? target.slice(1)
        : target.startsWith("word/")
          ? target
          : `word/${target.replace(/^\.\//, "")}`;
      const file = zip.file(path);
      if (!file) continue;
      const xml = await file.async("text");
      const doc = parseXml(xml);
      const paras = wChildren(doc.documentElement, "p");
      const text = paras.map((p) => collectText(p)).join(" ").replace(/\s+/g, " ").trim();
      parts.push({
        path,
        kind,
        text,
        hasPageNumberField: hasPageField(xml),
      });
    }
  }

  let titlePage = false;
  try {
    const doc = parseXml(documentXml);
    const body = wChild(doc.documentElement, "body");
    const sectPr = body ? wChild(body, "sectPr") : null;
    if (sectPr && wChild(sectPr, "titlePg")) titlePage = true;
  } catch {
    /* ignore */
  }

  return {
    parts,
    hasHeader: parts.some((p) => p.kind === "header"),
    hasFooter: parts.some((p) => p.kind === "footer"),
    hasPageNumberField: parts.some((p) => p.hasPageNumberField),
    titlePage,
  };
}
