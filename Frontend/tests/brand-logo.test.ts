import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

test('brand uses a shared accessible vector mark instead of the legacy panda image', () => {
  const logo = read('src/components/BrandLogo.vue')
  assert.match(logo, /<svg[\s\S]*viewBox="0 0 40 40"/)
  assert.match(logo, /<router-link to="\/"/)
  assert.match(logo, /aria-label="label"/)
  assert.match(logo, /var\(--button-background\)/)
  const header = read('src/components/AppHeader.vue')
  const footer = read('src/layouts/DefaultLayout.vue')
  assert.match(header, /<BrandLogo :label=/)
  assert.match(footer, /<BrandLogo compact/)
  assert.doesNotMatch(header, /panda\.png/)
  assert.doesNotMatch(footer, /panda\.png/)
})

test('browser favicon uses the same vector language and no page references legacy panda image', () => {
  const favicon = read('public/favicon.svg')
  const html = read('index.html')
  assert.match(favicon, /viewBox="0 0 64 64"/)
  assert.match(favicon, /<path/)
  assert.match(html, /type="image\/svg\+xml" href="\/favicon\.svg"/)
  assert.doesNotMatch(html, /panda\.png|开源熊猫/)
})