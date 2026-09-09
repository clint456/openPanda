import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('About content surfaces and text use semantic theme tokens, not fixed light colors', () => {
  const source = readFileSync(new URL('../src/views/About/index.vue', import.meta.url), 'utf8')
  const css = source.match(/<style scoped>([\s\S]*?)<\/style>/)![1]
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/i)
  for (const [selector, background] of [
    ['about__section', 'surface-panel'],
    ['skill__card', 'surface-page'],
  ]) {
    const rule = css.match(new RegExp(`\\.${selector}\\s*\\{([^}]+)\\}`))![1]
    assert.ok(rule.includes(`background: var(--${background})`), `${selector} must follow the theme`)
    assert.ok(rule.includes('var(--border-subtle)'), `${selector} needs a theme-aware border`)
  }
  assert.match(css, /\.about__section ul\s*\{[^}]*color:\s*var\(--text-primary\)/)
  assert.match(css, /\.skill__text\s*\{[^}]*color:\s*var\(--text-secondary\)/)
})

test('Markdown editor form and fullscreen container follow the theme', () => {
  const source = readFileSync(new URL('../src/views/Article/Editor.vue', import.meta.url), 'utf8')
  const css = source.match(/<style scoped>([\s\S]*?)<\/style>/)![1]
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/i)
  assert.match(css, /\.article-form\s*\{[^}]*background:\s*var\(--surface-panel\)/)
  assert.match(css, /\.editor-wrapper\.web-fullscreen\s*\{[^}]*background:\s*var\(--surface-page\)/)
  assert.match(css, /\.editor-wrapper :deep\(\.md-editor-preview\)[\s\S]*background:\s*var\(--surface-page\)/)
  assert.ok(source.includes(':theme="appStore.resolvedTheme"'))
})