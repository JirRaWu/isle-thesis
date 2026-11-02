const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

export function createW(doc: Document, local: string): Element {
  return doc.createElementNS(W_NS, `w:${local}`);
}

export function setWAttr(el: Element, local: string, value: string | number) {
  const v = String(value);
  el.setAttributeNS(W_NS, `w:${local}`, v);
  el.setAttribute(`w:${local}`, v);
}

export function ensureChild(parent: Element, doc: Document, local: string): Element {
  const existing = Array.from(parent.children).find(
    (el) => el.namespaceURI === W_NS && el.localName === local,
  );
  if (existing) return existing;
  const created = createW(doc, local);
  parent.appendChild(created);
  return created;
}

export function replaceChildren(parent: Element, children: Element[]) {
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  for (const child of children) parent.appendChild(child);
}

export function wLocalName(el: Element) {
  return el.localName || el.nodeName.replace(/^.*:/, "");
}
