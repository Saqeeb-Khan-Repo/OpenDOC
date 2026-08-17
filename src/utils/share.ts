/**
 * Encode a document for sharing via URL.
 * Uses base64 + URIComponent encoding to handle all Unicode characters safely.
 */
export function encodeSharePayload(data: { title: string; content: string }): string {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

/**
 * Decode a share payload from URL safely.
 */
export function decodeSharePayload(encoded: string): { title: string; content: string } | null {
  if (!encoded) return null;
  try {
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && typeof parsed.title === 'string' && typeof parsed.content === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a full shareable URL for a document.
 */
export function generateShareUrl(title: string, content: string): string {
  const encoded = encodeSharePayload({ title, content });
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://docflow.app';
  return `${base}/view?d=${encoded}`;
}

/**
 * Copy text to clipboard with modern async API and legacy execCommand fallback.
 * Never throws an unhandled error.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // 2. Fallback using temporary textarea
  if (typeof document !== 'undefined') {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }

  return false;
}
