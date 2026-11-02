import type { ParagraphProps, RunProps } from "./model";
import { wAttr, wChild, wIntAttr } from "./xml";

export function readRunProps(rPr: Element | null): RunProps {
  if (!rPr) return {};
  const rFonts = wChild(rPr, "rFonts");
  const sz = wChild(rPr, "sz") ?? wChild(rPr, "szCs");
  const bold = wChild(rPr, "b");
  const italic = wChild(rPr, "i");
  const props: RunProps = {};
  if (rFonts) {
    const ascii = wAttr(rFonts, "ascii") ?? wAttr(rFonts, "asciiTheme");
    const eastAsia = wAttr(rFonts, "eastAsia") ?? wAttr(rFonts, "eastAsiaTheme");
    const hAnsi = wAttr(rFonts, "hAnsi") ?? wAttr(rFonts, "hAnsiTheme");
    if (ascii) props.asciiFont = ascii;
    if (eastAsia) props.eastAsiaFont = eastAsia;
    if (hAnsi) props.hAnsiFont = hAnsi;
  }
  const size = wIntAttr(sz, "val");
  if (size != null) props.sizeHalfPoints = size;
  if (bold) props.bold = wAttr(bold, "val") !== "0" && wAttr(bold, "val") !== "false";
  if (italic) props.italic = wAttr(italic, "val") !== "0" && wAttr(italic, "val") !== "false";
  return props;
}

export function readParagraphProps(pPr: Element | null): ParagraphProps {
  if (!pPr) return {};
  const pStyle = wChild(pPr, "pStyle");
  const jc = wChild(pPr, "jc");
  const outlineLvl = wChild(pPr, "outlineLvl");
  const ind = wChild(pPr, "ind");
  const spacing = wChild(pPr, "spacing");
  const props: ParagraphProps = {};
  const styleId = wAttr(pStyle, "val");
  if (styleId) props.styleId = styleId;
  const align = wAttr(jc, "val");
  if (align) props.alignment = align;
  const outline = wIntAttr(outlineLvl, "val");
  if (outline != null) props.outlineLvl = outline;
  if (ind) {
    props.indentLeftTwip = wIntAttr(ind, "left") ?? wIntAttr(ind, "start");
    props.indentRightTwip = wIntAttr(ind, "right") ?? wIntAttr(ind, "end");
    props.indentFirstLineTwip = wIntAttr(ind, "firstLine");
    const hanging = wIntAttr(ind, "hanging");
    if (hanging != null) props.indentFirstLineTwip = -hanging;
  }
  if (spacing) {
    props.spacingBeforeTwip = wIntAttr(spacing, "before");
    props.spacingAfterTwip = wIntAttr(spacing, "after");
    props.line = wIntAttr(spacing, "line");
    const lineRule = wAttr(spacing, "lineRule");
    if (lineRule) props.lineRule = lineRule;
  }
  return props;
}

export function mergeRun(base: RunProps, over: RunProps): RunProps {
  return {
    asciiFont: over.asciiFont ?? base.asciiFont,
    eastAsiaFont: over.eastAsiaFont ?? base.eastAsiaFont,
    hAnsiFont: over.hAnsiFont ?? base.hAnsiFont,
    sizeHalfPoints: over.sizeHalfPoints ?? base.sizeHalfPoints,
    bold: over.bold ?? base.bold,
    italic: over.italic ?? base.italic,
  };
}

export function mergeParagraph(base: ParagraphProps, over: ParagraphProps): ParagraphProps {
  return {
    styleId: over.styleId ?? base.styleId,
    alignment: over.alignment ?? base.alignment,
    outlineLvl: over.outlineLvl ?? base.outlineLvl,
    indentLeftTwip: over.indentLeftTwip ?? base.indentLeftTwip,
    indentRightTwip: over.indentRightTwip ?? base.indentRightTwip,
    indentFirstLineTwip: over.indentFirstLineTwip ?? base.indentFirstLineTwip,
    spacingBeforeTwip: over.spacingBeforeTwip ?? base.spacingBeforeTwip,
    spacingAfterTwip: over.spacingAfterTwip ?? base.spacingAfterTwip,
    line: over.line ?? base.line,
    lineRule: over.lineRule ?? base.lineRule,
  };
}
