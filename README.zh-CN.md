<div align="center">

# 简屿 · 论文（Isle Thesis）

**本地免费检查毕业论文 Word 格式**

解析与检查都在浏览器完成，**文档不上传服务器**。

[English](./README.md) · [在线体验（部署后）](https://isle-thesis.hhtj.cn) · [开源仓库](https://github.com/JirRaWu/isle-thesis)

</div>

## 为什么做这个

排版规范细碎，改格式往往比改内容更耗人。市面上不少工具要收费或要求上传全文。简屿 · 论文把 OOXML 解析和规则引擎放进浏览器，对照常见高校模板给出可操作的问题清单。

同系列产品：

- [简屿 · 简历](https://isle-cv.hhtj.cn)
- [简屿 · 证件照](https://github.com/JirRaWu/isle-cv-photo)

## 功能

- **本地 DOCX 解析**：页边距、纸张、样式继承、段落字体/字号/行距/首行缩进、标题大纲级别
- **多模板**：通用国标、浙大 / 清华 / 北大参考模板（非正式官方稿，请以学院规范为准）
- **检查报告**：错误 / 警告 / 提示分级、分类筛选、附近原文定位、Markdown 导出
- **可选 AI**：自备 API Key，仅发送单条问题字段做白话解释，不上传整篇论文

## 技术栈

- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4
- JSZip（浏览器内解压 OOXML）

## 快速开始

```bash
pnpm install
pnpm dev
```

开发地址默认：`http://localhost:5180/`。

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
VITE_ISLE_CV_ORIGIN=https://isle-cv.hhtj.cn
VITE_ISLE_PHOTO_ORIGIN=https://isle-photo.hhtj.cn
```

## 部署

静态托管 `dist/` 即可。nginx 样例：[`deploy/nginx/30_isle-thesis.hhtj.cn_80_443.conf`](./deploy/nginx/30_isle-thesis.hhtj.cn_80_443.conf)（域名 `isle-thesis.hhtj.cn`，风格对齐证件照站）。

## 检查项一览

| 类别 | 内容 |
| --- | --- |
| 纸张 / 页边距 | A4、上下左右边距 |
| 正文 | 中西文字体、小四、1.5 倍行距、首行缩进 |
| 标题 | 1–3 级字体字号加粗、层级跳级 |
| 结构 | 摘要、关键词、Abstract、目录、参考文献、致谢 |
| 题注 | 图/表题格式与引用提示 |
| 版式卫生 | 连续空段过多 |

## 重要说明

模板规则是**参考实现**，各学院细节不同。报告仅供自查，不构成官方审核结论。

## License

Apache-2.0。详见 [LICENSE](./LICENSE)。
