import { DOMParser as XmldomParser } from "@xmldom/xmldom";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

/** Browser DOMParser when present; xmldom for Node unit tests. */
function createParser() {
  if (typeof globalThis.DOMParser !== "undefined") return new globalThis.DOMParser();
  return new XmldomParser();
}

export function parseXml(xml: string): Document {
  const doc = createParser().parseFromString(xml, "application/xml") as Document;
  // Browser parsers expose <parsererror>; xmldom throws or returns a partial tree.
  const err =
    typeof doc.querySelector === "function"
      ? doc.querySelector("parsererror")
      : Array.from(doc.childNodes).find(
          (node) => node.nodeName?.toLowerCase() === "parsererror" || (node as Element).localName === "parsererror",
        );
  if (err) throw new Error(`XML 解析失败：${err.textContent?.slice(0, 120) ?? "unknown"}`);
  return doc;
}

export function wChildren(parent: Element, local: string): Element[] {
  return Array.from(parent.children).filter((el) => el.namespaceURI === W_NS && el.localName === local);
}

export function wChild(parent: Element, local: string): Element | null {
  return wChildren(parent, local)[0] ?? null;
}

export function wAttr(el: Element | null | undefined, local: string): string | null {
  if (!el) return null;
  return (
    el.getAttributeNS(W_NS, local) ??
    el.getAttribute(`w:${local}`) ??
    el.getAttribute(local)
  );
}

export function wIntAttr(el: Element | null | undefined, local: string): number | undefined {
  const raw = wAttr(el, local);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Collect all descendant text under `w:t` nodes. */
export function collectText(el: Element): string {
  const parts: string[] = [];
  const walk = (node: Element) => {
    if (node.namespaceURI === W_NS && node.localName === "t") {
      parts.push(node.textContent ?? "");
      return;
    }
    for (const child of Array.from(node.children)) walk(child);
  };
  walk(el);
  return parts.join("");
}
