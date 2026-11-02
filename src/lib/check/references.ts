import type { DocModel } from "../docx/model";
import type { CheckIssue } from "../../types/thesis";
import { nextIssueId, snippetOf } from "./match";

const REF_HEADING = /^(参考文献|References)$/i;
const REF_ENTRY = /^\s*\[(\d+)\]\s*(.+)$/;
const YEAR = /(?:^|[^\d])((?:19|20)\d{2})(?:[^\d]|$)/;
const JOURNAL_MARK = /\[J\]/i;
const BOOK_MARK = /\[M\]/i;
const CONF_MARK = /\[C\]/i;
const THESIS_MARK = /\[D\]/i;
const WEB_MARK = /\[EB\/OL\]/i;

function findReferenceBlock(model: DocModel) {
  const start = model.paragraphs.findIndex((p) => REF_HEADING.test(p.text.trim()));
  if (start < 0) return null;
  const endMarkers = /^(致\s*谢|附录|Appendix|Acknowledgements?)$/i;
  let end = model.paragraphs.length;
  for (let i = start + 1; i < model.paragraphs.length; i += 1) {
    if (endMarkers.test(model.paragraphs[i]!.text.trim())) {
      end = i;
      break;
    }
  }
  return { start, end, paragraphs: model.paragraphs.slice(start + 1, end) };
}

function looksSparse(body: string) {
  // Very short or missing year / type marker → soft GB warning
  if (body.length < 12) return true;
  if (!YEAR.test(body)) return true;
  const hasType = JOURNAL_MARK.test(body) || BOOK_MARK.test(body) || CONF_MARK.test(body) || THESIS_MARK.test(body) || WEB_MARK.test(body);
  if (!hasType && !/[.。]/.test(body)) return true;
  return false;
}

/** Soft GB/T 7714-oriented checks on the 参考文献 section. */
export function checkReferences(model: DocModel): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const block = findReferenceBlock(model);
  if (!block) return issues;

  const entries = block.paragraphs
    .map((p) => {
      const match = p.text.trim().match(REF_ENTRY);
      if (!match) return null;
      return { index: p.index, num: Number(match[1]), body: match[2]!.trim(), text: p.text.trim() };
    })
    .filter(Boolean) as Array<{ index: number; num: number; body: string; text: string }>;

  if (!entries.length) {
    // Section exists but no [n] entries — maybe plain list
    const nonEmpty = block.paragraphs.filter((p) => p.text.trim());
    if (nonEmpty.length) {
      issues.push({
        id: nextIssueId("ref-format"),
        severity: "warning",
        category: "reference",
        title: "参考文献未使用 [序号] 格式",
        detail: "常见写法为「[1] 作者. 题名[J]. 刊名, 年, 卷(期): 页码.」。",
        fixHint: "将每条文献改成顺序编码制，并以 [1]、[2]… 开头。",
        paragraphIndex: nonEmpty[0]!.index,
        snippet: snippetOf(nonEmpty[0]!.text),
      });
    }
    return issues;
  }

  // Continuity from 1
  for (let i = 0; i < entries.length; i += 1) {
    const expected = i + 1;
    if (entries[i]!.num !== expected) {
      issues.push({
        id: nextIssueId("ref-order"),
        severity: "warning",
        category: "reference",
        title: "参考文献序号不连续",
        detail: `第 ${i + 1} 条期望为 [${expected}]，实际为 [${entries[i]!.num}]。`,
        fixHint: "按出现顺序重新编号，确保从 [1] 连续递增。",
        paragraphIndex: entries[i]!.index,
        snippet: snippetOf(entries[i]!.text),
        expected: `[${expected}]`,
        actual: `[${entries[i]!.num}]`,
      });
      break;
    }
  }

  // Duplicate numbers
  const seen = new Map<number, number>();
  for (const entry of entries) {
    if (seen.has(entry.num)) {
      issues.push({
        id: nextIssueId("ref-dup"),
        severity: "error",
        category: "reference",
        title: `参考文献序号 [${entry.num}] 重复`,
        detail: "同一序号出现多次，答辩材料中容易被指出。",
        fixHint: "合并重复条目或重新编号。",
        paragraphIndex: entry.index,
        snippet: snippetOf(entry.text),
      });
    }
    seen.set(entry.num, entry.index);
  }

  // Soft content quality (sample up to 12)
  let sparse = 0;
  let firstSparse = entries[0];
  for (const entry of entries.slice(0, 12)) {
    if (looksSparse(entry.body)) {
      sparse += 1;
      firstSparse = entry;
    }
  }
  if (sparse >= Math.max(1, Math.ceil(Math.min(entries.length, 12) * 0.34))) {
    issues.push({
      id: nextIssueId("ref-gb"),
      severity: "info",
      category: "reference",
      title: "部分文献条目可能不符合常见国标写法",
      detail: `抽样发现约 ${sparse} 条缺少年份、文献类型标识（如 [J]/[M]）或信息过短。此为启发式提示，请对照 GB/T 7714 与学院细则。`,
      fixHint: "补全作者、题名、文献类型、出版年等字段；期刊用 [J]，专著用 [M]。",
      paragraphIndex: firstSparse?.index,
      snippet: firstSparse ? snippetOf(firstSparse.text) : undefined,
    });
  }

  return issues;
}
