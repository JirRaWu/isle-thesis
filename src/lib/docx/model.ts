export interface RunProps {
  asciiFont?: string;
  eastAsiaFont?: string;
  hAnsiFont?: string;
  sizeHalfPoints?: number;
  bold?: boolean;
  italic?: boolean;
}

export interface ParagraphProps {
  styleId?: string;
  alignment?: string;
  outlineLvl?: number;
  indentLeftTwip?: number;
  indentRightTwip?: number;
  indentFirstLineTwip?: number;
  spacingBeforeTwip?: number;
  spacingAfterTwip?: number;
  line?: number;
  lineRule?: string;
}

export interface StyleDef {
  styleId: string;
  name?: string;
  type?: string;
  basedOn?: string;
  paragraph: ParagraphProps;
  run: RunProps;
}

export interface ResolvedRun extends RunProps {
  text: string;
}

export interface DocParagraph {
  index: number;
  text: string;
  styleId?: string;
  /** Resolved outline level 0–8 when this is a heading-like paragraph. */
  outlineLvl?: number;
  alignment?: string;
  indentFirstLineTwip?: number;
  indentLeftTwip?: number;
  spacingBeforeTwip?: number;
  spacingAfterTwip?: number;
  line?: number;
  lineRule?: string;
  run: RunProps;
  runs: ResolvedRun[];
  isEmpty: boolean;
}

export interface PageBox {
  widthTwip: number;
  heightTwip: number;
  topTwip: number;
  bottomTwip: number;
  leftTwip: number;
  rightTwip: number;
  headerTwip?: number;
  footerTwip?: number;
}

export interface DocModel {
  fileName: string;
  page: PageBox;
  defaults: { paragraph: ParagraphProps; run: RunProps };
  styles: Map<string, StyleDef>;
  paragraphs: DocParagraph[];
}
