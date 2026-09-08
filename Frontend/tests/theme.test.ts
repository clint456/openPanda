import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { createThemeController, normalizeTheme, resolveTheme } from '../src/shared/lib/theme.ts'
import type { ThemeEnvironment, ThemePreference, ResolvedTheme } from '../src/shared/lib/theme.ts'

test('preferences default to system and preserve previous explicit choices', () => {
  for (const value of [null, undefined, '', 'invalid', 'system']) assert.equal(normalizeTheme(value), 'system')
  for (const preference of ['system', 'light', 'dark'] as const) {
    for (const dark of [true, false]) {
      assert.equal(resolveTheme(preference, dark), preference === 'system' ? (dark ? 'dark' : 'light') : preference)
    }
  }
})

test('controller follows system, explicit overrides, storage sync and listener cleanup', () => {
  let systemDark = true
  let stored: string | null = null
  let systemListener: (() => void) | undefined
  let storageListener: ((value: string | null) => void) | undefined
  let applied: ResolvedTheme = 'light'
  let preference: ThemePreference = 'light'
  const environment: ThemeEnvironment = {
    read: () => stored, write: value => { stored = value }, systemDark: () => systemDark,
    onSystemChange: listener => { systemListener = listener; return () => { systemListener = undefined } },
    onStorageChange: listener => { storageListener = listener; return () => { storageListener = undefined } },
    apply: value => { applied = value },
  }
  const controller = createThemeController(environment, value => { preference = value })
  assert.equal(applied, 'dark'); assert.equal(preference, 'system')
  controller.set('light'); assert.equal(stored, 'light'); assert.equal(applied, 'light')
  systemListener!(); assert.equal(applied, 'light')
  controller.set('system'); assert.equal(applied, 'dark')
  systemDark = false; systemListener!(); assert.equal(applied, 'light')
  storageListener!('dark'); assert.equal(applied, 'dark'); assert.equal(preference, 'dark')
  storageListener!(null); assert.equal(applied, 'light'); assert.equal(preference, 'system')
  controller.dispose(); assert.equal(systemListener, undefined); assert.equal(storageListener, undefined)
})

test('blocked storage does not prevent an in-memory theme choice', () => {
  let applied = ''
  const controller = createThemeController({
    read() { throw new Error('blocked') }, write() { throw new Error('blocked') },
    systemDark: () => true, onSystemChange: () => () => {}, onStorageChange: () => () => {},
    apply: value => { applied = value },
  }, () => {})
  assert.equal(applied, 'dark'); controller.set('light'); assert.equal(applied, 'light')
  controller.dispose()
})

test('head bootstrap matches runtime resolution, including unavailable storage', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const script = html.match(/<script id="theme-bootstrap">([\s\S]*?)<\/script>/)![1]
  assert.ok(html.indexOf('theme-bootstrap') < html.indexOf('/src/main.ts'))
  for (const stored of [null, 'light', 'dark', 'system', 'invalid', 'blocked']) {
    for (const dark of [false, true]) {
      const root = { dataset: { theme: '' }, style: { colorScheme: '' }, classList: { toggle(_name: string, value: boolean) { assert.equal(value, root.dataset.theme === 'dark') } } }
      runInNewContext(script, {
        localStorage: { getItem() { if (stored === 'blocked') throw new Error('blocked'); return stored } },
        window: { matchMedia: () => ({ matches: dark }) }, document: { documentElement: root },
      })
      assert.equal(root.dataset.theme, resolveTheme(normalizeTheme(stored), dark))
      assert.equal(root.style.colorScheme, root.dataset.theme)
    }
  }
})

test('Modern foreground/link/button pairs meet normal-text contrast requirements', () => {
  const css = readFileSync(new URL('../src/styles/themes.css', import.meta.url), 'utf8')
  const colors = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(match => [match[1], match[2]]))
  function luminance(hex: string) {
    const rgb = hex.slice(1).match(/../g)!.map(channel => {
      const value = parseInt(channel, 16) / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
  }
  for (const theme of ['light', 'dark']) {
    const pairs = ['text', 'secondary', 'link'].flatMap(role => ['page', 'panel'].map(background => [`${theme}-${role}`, `${theme}-${background}`]))
    pairs.push(['button-text', `${theme}-button`], ['button-text', `${theme}-button-hover`])
    for (const [foreground, background] of pairs) {
      const a = luminance(colors[foreground]); const b = luminance(colors[background])
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)}`)
    }
  }
})