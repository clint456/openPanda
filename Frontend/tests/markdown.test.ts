import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

test('Newsprint light and dark text colors keep readable contrast', () => {
  const css = readFileSync(new URL('../src/styles/newsprint.css', import.meta.url), 'utf8')
  const themeBlock = (selector: RegExp) => css.match(selector)![1]
  const declarations = (block: string) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]))
  const resolveColor = (values: Record<string, string>, name: string): string => {
    const value = values[name]
    return value.startsWith('var(--') ? resolveColor(values, value.slice(6, -1)) : value
  }
  const luminance = (hex: string) => {
    const values = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722
  }
  for (const [theme, selector, page] of [
    ['light', /:root, :root\[data-theme='light'\] \{([\s\S]*?)\n\}/, '#f7f6f2'],
    ['dark', /:root\[data-theme='dark'\] \{([\s\S]*?)\n\}/, '#1f1f1f'],
  ] as const) {
    const values = { ...declarations(themeBlock(selector)), 'surface-page': page }
    const ratio = (Math.max(luminance(resolveColor(values, 'newsprint-ink')), luminance(resolveColor(values, 'newsprint-bg'))) + .05) / (Math.min(luminance(resolveColor(values, 'newsprint-ink')), luminance(resolveColor(values, 'newsprint-bg'))) + .05)
    assert.ok(ratio >= 4.5, `${theme} Newsprint contrast is ${ratio.toFixed(2)}`)
  }
  assert.match(css, /\.newsprint-theme, \.prose[\s\S]*font-family: var\(--font-reading-title\)/)
  assert.match(css, /\.newsprint-theme pre, \.prose pre[\s\S]*background: var\(--newsprint-code-bg\)/)

  const detail = readFileSync(new URL('../src/views/Article/Detail.vue', import.meta.url), 'utf8')
  assert.match(detail, /\.article-detail\s*\{[^}]*background:\s*var\(--newsprint-bg\)/)
})