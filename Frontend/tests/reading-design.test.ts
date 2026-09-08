import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('reading typography separates Chinese headings, body and code without remote fonts', () => {
  const css = read('../src/styles/typography.css')
  assert.match(css, /--font-sans:.*PingFang SC.*Noto Sans CJK SC/)
  assert.match(css, /:lang\(zh\)\s*\{[^}]*--heading-tracking:\s*\.025em/)
  assert.match(css, /--font-reading-title:.*Noto Serif CJK SC/)
  assert.doesNotMatch(css, /https?:|@font-face/)
  for (const path of ['../src/views/Home/index.vue', '../src/modules/content/components/ArticleRow.vue', '../src/views/Article/Detail.vue']) {
    assert.ok(read(path).includes('letter-spacing: var(--heading-tracking)'), path)
  }
  assert.match(read('../src/views/Article/Detail.vue'), /font-family: var\(--font-mono\)/)
})

test('paper grain is local, noninteractive, behind content and disabled in accessible modes', () => {
  const css = read('../src/styles/materials.css')
  assert.match(css, /body::before\s*\{[^}]*z-index:\s*-1;[^}]*pointer-events:\s*none;/)
  assert.ok(css.includes("url('/textures/paper.svg')"))
  assert.match(css, /\.site-header\s*\{\s*background:\s*var\(--surface-panel\)/)
  assert.ok(css.includes('@supports'))
  assert.match(css, /@media \(prefers-contrast: more\), \(forced-colors: active\), print/)
  assert.match(css, /body::before\s*\{\s*display:\s*none;/)
  const svg = read('../public/textures/paper.svg')
  assert.ok(svg.includes('stitchTiles="stitch"'))
  assert.ok(Buffer.byteLength(svg) < 2048)
  assert.doesNotMatch(svg, /<script|<image|href=/)
})