import type { ParagraphProps, RunProps, StyleDef } from "./model";
import { mergeParagraph, mergeRun, readParagraphProps, readRunProps } from "./props";
import { parseXml, wAttr, wChild, wChildren } from "./xml";

export interface StylesBundle {
  styles: Map<string, StyleDef>;
  defaults: { paragraph: ParagraphProps; run: RunProps };
  /** Map "heading 1" style names → styleId for outline detection. */
  headingStyleIds: Map<number, string>;
}

function emptyDefaults() {
  return {
    paragraph: {} as ParagraphProps,
    run: { sizeHalfPoints: 24 } as RunProps,
  };
}

export function parseStylesXml(xml: string): StylesBundle {
  const doc = parseXml(xml);
  const root = doc.documentElement;
  const styles = new Map<string, StyleDef>();
  const defaults = emptyDefaults();
  const headingStyleIds = new Map<number, string>();

  const docDefaults = wChild(root, "docDefaults");
  if (docDefaults) {
    const rPrDefault = wChild(docDefaults, "rPrDefault");
    const pPrDefault = wChild(docDefaults, "pPrDefault");
    defaults.run = mergeRun(defaults.run, readRunProps(rPrDefault ? wChild(rPrDefault, "rPr") : null));
    defaults.paragraph = mergeParagraph(
      defaults.paragraph,
      readParagraphProps(pPrDefault ? wChild(pPrDefault, "pPr") : null),
    );
  }

  for (const styleEl of wChildren(root, "style")) {
    const styleId = wAttr(styleEl, "styleId");
    if (!styleId) continue;
    const type = wAttr(styleEl, "type") ?? undefined;
    const name = wAttr(wChild(styleEl, "name"), "val") ?? undefined;
    const basedOn = wAttr(wChild(styleEl, "basedOn"), "val") ?? undefined;
    const paragraph = readParagraphProps(wChild(styleEl, "pPr"));
    const run = readRunProps(wChild(styleEl, "rPr"));
    styles.set(styleId, { styleId, name, type, basedOn, paragraph, run });

    if (name) {
      const match = name.match(/^heading\s*(\d+)$/i) ?? name.match(/^标题\s*(\d+)$/);
      if (match) headingStyleIds.set(Number(match[1]) - 1, styleId);
    }
    // Common Chinese thesis custom style ids
    if (/^heading\s*1$/i.test(styleId) || styleId === "1" || /标题1|Heading1/i.test(styleId)) {
      headingStyleIds.set(0, headingStyleIds.get(0) ?? styleId);
    }
  }

  // Built-in outlineLvl on style wins
  for (const style of styles.values()) {
    if (style.paragraph.outlineLvl != null && style.paragraph.outlineLvl <= 2) {
      headingStyleIds.set(style.paragraph.outlineLvl, headingStyleIds.get(style.paragraph.outlineLvl) ?? style.styleId);
    }
  }

  return { styles, defaults, headingStyleIds };
}

/** Resolve a style chain into flattened paragraph + run props. */
export function resolveStyle(
  styleId: string | undefined,
  bundle: StylesBundle,
): { paragraph: ParagraphProps; run: RunProps } {
  let paragraph = { ...bundle.defaults.paragraph };
  let run = { ...bundle.defaults.run };
  if (!styleId) return { paragraph, run };

  const chain: StyleDef[] = [];
  const seen = new Set<string>();
  let current: string | undefined = styleId;
  while (current && !seen.has(current)) {
    seen.add(current);
    const style = bundle.styles.get(current);
    if (!style) break;
    chain.push(style);
    current = style.basedOn;
  }

  for (const style of chain.reverse()) {
    paragraph = mergeParagraph(paragraph, style.paragraph);
    run = mergeRun(run, style.run);
  }
  return { paragraph, run };
}

export function detectOutlineLevel(
  styleId: string | undefined,
  directOutline: number | undefined,
  bundle: StylesBundle,
): number | undefined {
  if (directOutline != null) return directOutline;
  if (!styleId) return undefined;
  for (const [level, id] of bundle.headingStyleIds) {
    if (id === styleId) return level;
  }
  const style = bundle.styles.get(styleId);
  if (style?.paragraph.outlineLvl != null) return style.paragraph.outlineLvl;
  if (style?.name) {
    const match = style.name.match(/heading\s*(\d+)/i) ?? style.name.match(/标题\s*(\d+)/);
    if (match) return Number(match[1]) - 1;
  }
  if (/heading\s*(\d+)/i.test(styleId)) {
    return Number(styleId.match(/heading\s*(\d+)/i)![1]) - 1;
  }
  return undefined;
}
