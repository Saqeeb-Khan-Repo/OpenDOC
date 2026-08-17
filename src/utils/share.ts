/**
 * Encode a document for sharing via URL.
 * Uses base64 + URIComponent encoding to handle all Unicode characters safely.
 */
export function encodeSharePayload(data: { title: string; content: string }): string {
  const json = JSON.stringify(data)
  // encodeURIComponent handles Unicode, btoa handles base64
  return btoa(encodeURIComponent(json))
}

/**
 * Decode a share payload from URL.
 */
export function decodeSharePayload(encoded: string): { title: string; content: string } | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const parsed = JSON.parse(json)
    if (typeof parsed.title === 'string' && typeof parsed.content === 'string') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

/**
 * Generate a full shareable URL for a document.
 */
export function generateShareUrl(title: string, content: string): string {
  const encoded = encodeSharePayload({ title, content })
  const base = window.location.origin
  return `${base}/view?d=${encoded}`
}

/**
 * Copy text to clipboard, returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  }
}
