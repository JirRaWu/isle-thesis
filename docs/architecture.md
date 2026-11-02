# 架构说明

## 目标

在浏览器内完成毕业论文 `.docx` 格式自查：文档不出本机，规则可扩展，报告可导出。

## 数据流

```
.docx 文件
  → JSZip 解压 OOXML
  → styles.xml + document.xml 解析
  → DocModel（页面、样式链、段落）
  → runChecks(template)
  → CheckReport（分级问题 + 得分）
  → UI 筛选 / 预览 / Markdown 导出
  → （可选）AI：仅发送单条 issue 字段
```

## 模块

| 路径 | 职责 |
| --- | --- |
| `src/lib/docx` | OOXML 解析、单位换算、样式继承 |
| `src/lib/templates` | 学校 / 国标模板声明 |
| `src/lib/check` | 可组合检查器 |
| `src/lib/report` | Markdown 报告 |
| `src/lib/ai` | 浏览器直连 OpenAI 兼容接口 |
| `src/components/studio` | 上传、模板、报告、预览、AI 设置 |

## 扩展新学校模板

1. 在 `src/lib/templates/` 新增一份 `ThesisTemplate`
2. 注册到 `THESIS_TEMPLATES`
3. 用真实学院规范校准边距、字体、标题字号
4. 在 UI 免责声明中标明「非正式官方模板」

## 测试

`tests/fixtures/build-docx.ts` 生成最小合法 DOCX，供解析与检查单测使用。
