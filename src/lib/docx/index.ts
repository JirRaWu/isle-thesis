export { parseDocx } from "./parse";
export { describeApplied, fixDocx, type FixResult } from "./fix";
export type { DocModel, DocParagraph, PageBox, RunProps, StyleDef } from "./model";
export {
  A4_HEIGHT_TWIP,
  A4_WIDTH_TWIP,
  approxEqual,
  formatMm,
  formatMultiple,
  formatPt,
  halfPointToPt,
  lineMultipleFromWord,
  mmToTwip,
  ptToHalfPoint,
  twipToMm,
} from "./units";
