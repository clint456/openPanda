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

export interface MarkdownHeading {
  id: string
  text: string
  level: number
}

function headingSlug(value: string, used: Set<string>): string {
  const plain = value.replace(/[`*_~[\]()>#]/g, '').trim().toLowerCase()
  const base = plain.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section'
  let id = base
  let index = 2
  while (used.has(id)) id = `${base}-${index++}`
  used.add(id)
  return id
}

/** Render Markdown and add deterministic IDs to H1-H3 headings for the reading TOC. */
export function renderMarkdownWithToc(source: string): { html: string; headings: MarkdownHeading[] } {
  const headings: MarkdownHeading[] = []
  const used = new Set<string>()
  const html = renderMarkdown(source).replace(/<h([1-3])>([\s\S]*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    const text = inner.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
    const id = headingSlug(text, used)
    headings.push({ id, text, level: Number(level) })
    return `<h${level} id="${id}">${inner}</h${level}>`
  })
  return { html, headings }
}