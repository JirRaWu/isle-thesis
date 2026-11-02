import type { DocModel } from "../docx/model";
import type { CheckIssue } from "../../types/thesis";
import { nextIssueId } from "./match";

/** Soft checks for headers / footers / page numbers. */
export function checkPagination(model: DocModel): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const { chrome } = model;

  if (!chrome.hasHeader && !chrome.hasFooter) {
    issues.push({
      id: nextIssueId("chrome-missing"),
      severity: "info",
      category: "pagination",
      title: "未检测到页眉或页脚",
      detail: "多数学院要求正文页包含页码；有的还要求页眉写论文题目或「本科毕业论文」。",
      fixHint: "Word → 插入 → 页眉/页脚；在页脚插入页码。封面常需「首页不同」。",
    });
    return issues;
  }

  if (!chrome.hasPageNumberField) {
    issues.push({
      id: nextIssueId("page-num"),
      severity: "warning",
      category: "pagination",
      title: "未检测到页码域",
      detail: "页眉/页脚中没有 PAGE 域。若页码是手打数字，换页后不会自动更新。",
      fixHint: "删除手写页码，改用「插入 → 页码」。",
    });
  }

  if (chrome.hasHeader && chrome.parts.filter((p) => p.kind === "header").every((p) => !p.text.trim())) {
    issues.push({
      id: nextIssueId("header-empty"),
      severity: "info",
      category: "pagination",
      title: "页眉为空",
      detail: "已存在页眉部件，但没有可见文字。",
      fixHint: "按学院要求填写页眉，或删除空白页眉。",
    });
  }

  if (!chrome.titlePage) {
    issues.push({
      id: nextIssueId("title-page"),
      severity: "info",
      category: "pagination",
      title: "未开启「首页不同」",
      detail: "封面/原创性声明页通常不应显示正文页眉页脚。",
      fixHint: "页眉页脚工具 → 勾选「首页不同」，再分节设置页码起始。",
    });
  }

  return issues;
}
