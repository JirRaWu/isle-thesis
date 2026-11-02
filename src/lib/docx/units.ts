/** Word layout unit: 1 inch = 1440 twips. */
export const TWIPS_PER_INCH = 1440;
export const TWIPS_PER_CM = TWIPS_PER_INCH / 2.54;
export const TWIPS_PER_MM = TWIPS_PER_CM / 10;

/** A4 in twips (210mm × 297mm). */
export const A4_WIDTH_TWIP = 11906;
export const A4_HEIGHT_TWIP = 16838;

/** Word auto line spacing: 240 = single. */
export const LINE_SINGLE = 240;

export const twipToMm = (twip: number) => (twip / TWIPS_PER_INCH) * 25.4;
export const mmToTwip = (mm: number) => Math.round((mm / 25.4) * TWIPS_PER_INCH);
export const halfPointToPt = (half: number) => half / 2;
export const ptToHalfPoint = (pt: number) => Math.round(pt * 2);
export const lineMultipleFromWord = (line: number, lineRule?: string | null) => {
  if (!lineRule || lineRule === "auto") return line / LINE_SINGLE;
  // exact / atLeast are in twips — approximate as points/12 for display only
  return line / LINE_SINGLE;
};

export const approxEqual = (actual: number, expected: number, tolerance: number) =>
  Math.abs(actual - expected) <= tolerance;

export const formatMm = (mm: number) => `${mm.toFixed(1).replace(/\.0$/, "")} mm`;
export const formatPt = (pt: number) => `${Number(pt.toFixed(1))} pt`;
export const formatMultiple = (m: number) => `${Number(m.toFixed(2))} 倍`;
