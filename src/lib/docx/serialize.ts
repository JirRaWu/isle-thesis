import { XMLSerializer as XmldomSerializer } from "@xmldom/xmldom";

/** Serialize a DOM Document back to OOXML text. */
export function serializeXml(doc: Document): string {
  let xml: string;
  if (typeof globalThis.XMLSerializer !== "undefined") {
    xml = new globalThis.XMLSerializer().serializeToString(doc);
  } else {
    // xmldom's types don't match the lib.dom Document; cast through unknown.
    xml = new XmldomSerializer().serializeToString(doc as unknown as Parameters<XmldomSerializer["serializeToString"]>[0]);
  }
  if (!xml.startsWith("<?xml")) {
    xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${xml}`;
  }
  return xml;
}
