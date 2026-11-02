<div align="center">

# Isle Thesis · 简屿 · 论文

**Free, local thesis format checking for Word (.docx)**

Parsing and checks run in your browser. **Documents never leave your device.**

[简体中文](./README.zh-CN.md) · [GitHub](https://github.com/JirRaWu/isle-thesis)

</div>

## Why

Formatting rules are tedious. Many tools charge money or require uploading the full thesis. Isle Thesis unpacks OOXML in the browser and checks it against common Chinese university-style templates.

Sibling products:

- [Isle CV](https://isle-cv.hhtj.cn) — resume editor
- [Isle Photo](https://github.com/JirRaWu/isle-cv-photo) — ID photo tool

## Features

- **Local DOCX parsing** — page size, margins, style inheritance, fonts/sizes/line spacing/indents, heading outline levels
- **Templates** — generic GB-style undergrad plus ZJU / THU / PKU flavoured presets (unofficial approximations)
- **Report** — error / warning / info, category filters, nearby snippet, Markdown export
- **Optional AI** — bring your own API key; only issue fields are sent for plain-language help

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4
- JSZip

## Quick start

```bash
pnpm install
pnpm dev
```

Dev server: `http://localhost:5180/`

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Environment

Copy `.env.example` to `.env.local` if you need sibling product links.

## License

Apache-2.0. See [LICENSE](./LICENSE).
