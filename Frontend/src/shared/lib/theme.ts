export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'
export const THEME_STORAGE_KEY = 'theme'
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'

export function normalizeTheme(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference
}

export interface ThemeEnvironment {
  read: () => string | null
  write: (value: ThemePreference) => void
  systemDark: () => boolean
  onSystemChange: (listener: () => void) => () => void
  onStorageChange: (listener: (value: string | null) => void) => () => void
  apply: (theme: ResolvedTheme) => void
}

// No browser globals here: policy and lifecycle can be tested without a DOM.
export function createThemeController(
  environment: ThemeEnvironment,
  changed: (preference: ThemePreference, resolved: ResolvedTheme) => void,
) {
  let preference: ThemePreference = 'system'
  try { preference = normalizeTheme(environment.read()) } catch { /* Storage may be blocked. */ }
  function apply() {
    const resolved = resolveTheme(preference, environment.systemDark())
    environment.apply(resolved)
    changed(preference, resolved)
  }
  const stopSystem = environment.onSystemChange(apply)
  const stopStorage = environment.onStorageChange(value => {
    preference = normalizeTheme(value)
    apply()
  })
  apply()
  return {
    set(value: ThemePreference) {
      preference = normalizeTheme(value)
      try { environment.write(preference) } catch { /* Keep the in-memory preference. */ }
      apply()
    },
    dispose() { stopSystem(); stopStorage() },
  }
}

export function browserThemeEnvironment(): ThemeEnvironment {
  const media = window.matchMedia(THEME_MEDIA_QUERY)
  return {
    read: () => localStorage.getItem(THEME_STORAGE_KEY),
    write: value => localStorage.setItem(THEME_STORAGE_KEY, value),
    systemDark: () => media.matches,
    onSystemChange(listener) {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    },
    onStorageChange(listener) {
      const handler = (event: StorageEvent) => {
        if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
        try { if (event.storageArea !== window.localStorage) return } catch { return }
        listener(event.newValue)
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    },
    apply(theme) {
      document.documentElement.dataset.theme = theme
      document.documentElement.style.colorScheme = theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
    },
  }
}