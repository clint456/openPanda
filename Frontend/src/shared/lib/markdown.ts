import { Marked } from 'marked'

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
}

export function safeUrl(value: string, image = false): string | null {
  const url = value.trim()
  if (!url || [...url].some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127) || url.includes('\\') || url.startsWith('//')) return null
  if (/^(https?:\/\/)/i.test(url) || (!image && /^mailto:/i.test(url))) return url
  if (/^[a-z][a-z\d+.-]*:/i.test(url) || url.includes('&')) return null
  return url
}

// Raw HTML is deliberately escaped, not sanitized with fragile regexes.
// Only the Markdown renderer can emit markup; attributes are always escaped.
const parser = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html({ text }) { return escapeHtml(text) },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens)
      const url = safeUrl(href)
      return url ? `<a href="${escapeHtml(url)}"${title ? ` title="${escapeHtml(title)}"` : ''} rel="noopener noreferrer">${label}</a>` : label
    },
    image({ href, title, text }) {
      const url = safeUrl(href, true)
      return url ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" decoding="async">` : escapeHtml(text)
    },
  },
})

export function renderMarkdown(source: string): string {
  return parser.parse(source, { async: false })
}