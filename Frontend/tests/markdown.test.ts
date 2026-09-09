import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown, renderMarkdownWithToc, safeUrl } from '../src/shared/lib/markdown.ts'

test('raw HTML, scripts, event handlers and SVG are escaped', () => {
  for (const source of ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '<svg onload=alert(1)>']) {
    const html = renderMarkdown(source)
    assert.ok(!html.includes('<script') && !html.includes('<img') && !html.includes('<svg'))
    assert.ok(html.includes('&lt;'))
  }
})

test('unsafe protocols and obfuscated URLs are rejected', () => {
  for (const url of ['javascript:alert(1)', 'data:image/svg+xml,x', 'vbscript:x', '//evil.test', '\\evil.test', 'java\nscript:x', 'javascript&#58;x']) {
    assert.equal(safeUrl(url), null)
  }
  assert.ok(!renderMarkdown('[x](javascript:alert%281%29)').includes('href='))
  assert.ok(!renderMarkdown('![x](data:text/html,hi)').includes('<img'))
})

test('ordinary Markdown, code, links and uploaded images remain usable', () => {
  const html = renderMarkdown('# Heading\n\n[docs](https://example.com)\n\n![diagram](/uploads/diagram.png)\n\n```c\nint main() {}\n```')
  assert.match(html, /<h1>Heading<\/h1>/)
  assert.match(html, /href="https:\/\/example.com"/)
  assert.match(html, /src="\/uploads\/diagram.png"/)
  assert.match(html, /language-c/)
})

test('Markdown headings receive stable unique IDs for the reading table of contents', () => {
  const result = renderMarkdownWithToc('# 总览\n\n## 安装步骤\n\n### 安装步骤\n\n## 安装步骤')
  assert.deepEqual(result.headings, [
    { id: '总览', text: '总览', level: 1 },
    { id: '安装步骤', text: '安装步骤', level: 2 },
    { id: '安装步骤-2', text: '安装步骤', level: 3 },
    { id: '安装步骤-3', text: '安装步骤', level: 2 },
  ])
  assert.match(result.html, /<h2 id="安装步骤-3">安装步骤<\/h2>/)
})