import { FileType } from '@/types';
import { extractTextFromHtml } from './cn';

/**
 * Download a string as a file in the browser.
 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export document to TXT
 */
export function exportAsTxt(title: string, html: string) {
  const text = extractTextFromHtml(html);
  downloadBlob(text, `${title}.txt`, 'text/plain');
}

/**
 * Export document to HTML
 */
export function exportAsHtml(title: string, html: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1a1a1a; }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-top: 1.5em; }
    p { margin: 1em 0; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px 12px; }
    th { background: #f5f5f5; font-weight: 600; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #2563eb; margin: 0; padding-left: 1em; color: #555; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    a { color: #2563eb; }
    ul, ol { padding-left: 1.5em; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${html}
</body>
</html>`;
  downloadBlob(fullHtml, `${title}.html`, 'text/html');
}

/**
 * Export document to Markdown (basic conversion)
 */
export function exportAsMarkdown(title: string, html: string) {
  // Simple HTML→Markdown conversion
  let md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_')
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/gi, '![$2]($1)')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, c) => c.split('\n').map((l: string) => `> ${l}`).join('\n') + '\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1\n')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const full = `# ${title}\n\n${md}`;
  downloadBlob(full, `${title}.md`, 'text/markdown');
}

/**
 * Export document as PDF via browser print dialog.
 * Opens a styled print window with the document content.
 */
export function exportAsPrintPdf(title: string, html: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;
  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { margin: 1in; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #111;
      max-width: 100%;
    }
    h1 { font-size: 24pt; margin: 0 0 0.5em; border-bottom: 2px solid #333; padding-bottom: 0.25em; }
    h2 { font-size: 18pt; margin: 1.2em 0 0.4em; }
    h3 { font-size: 14pt; margin: 1em 0 0.3em; }
    h4, h5, h6 { font-size: 12pt; margin: 0.8em 0 0.2em; }
    p  { margin: 0.6em 0; }
    a  { color: #1d4ed8; text-decoration: underline; }
    blockquote { border-left: 4px solid #94a3b8; margin: 1em 0; padding: 0.5em 1em; color: #555; font-style: italic; }
    code { background: #f3f4f6; padding: 2px 5px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 10pt; }
    pre  { background: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; font-size: 10pt; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    td, th { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
    li { margin: 0.2em 0; }
    img { max-width: 100%; height: auto; border-radius: 4px; page-break-inside: avoid; }
    hr  { border: none; border-top: 1px solid #d1d5db; margin: 1.5em 0; }
    [data-border-box] { border: 2px solid #94a3b8; border-radius: 6px; padding: 12px 16px; margin: 8px 0; }
    input[type="checkbox"] { margin-right: 6px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${html}
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
  printWindow.document.close();
}


/**
 * Read a file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Convert imported file content to HTML for the editor
 */
export async function importFileToHtml(file: File): Promise<{ title: string; content: string; fileType: FileType }> {
  const ext = (file.name.split('.').pop()?.toLowerCase() || 'txt') as string;
  const title = file.name.replace(/\.[^.]+$/, '');
  const raw = await readFileAsText(file);

  let content = '';
  let finalType: FileType = 'txt';

  switch (ext) {
    case 'html':
    case 'htm':
      finalType = 'html';
      // Extract body content or use full
      const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      content = bodyMatch ? bodyMatch[1].trim() : raw;
      break;
    case 'md':
    case 'markdown':
      finalType = 'md';
      content = markdownToHtml(raw);
      break;
    case 'csv':
      finalType = 'csv';
      content = csvToHtmlTable(raw);
      break;
    case 'json':
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'css':
    case 'py':
    case 'sql':
    case 'xml':
    case 'yaml':
    case 'yml':
      finalType = 'txt';
      content = `<pre><code>${escapeHtml(raw)}</code></pre>`;
      break;
    case 'rtf':
      finalType = 'rtf';
      // Basic RTF stripping
      const stripped = raw.replace(/\{\\[^}]+\}|\\[a-z]+\d*\s?|[{}]/g, ' ').replace(/\s+/g, ' ').trim();
      content = `<p>${escapeHtml(stripped)}</p>`;
      break;
    default:
      finalType = (['doc', 'docx', 'pdf', 'txt', 'md', 'html', 'rtf', 'xlsx', 'csv'].includes(ext) ? ext : 'txt') as FileType;
      content = raw
        .split('\n')
        .map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : '<p><br/></p>')
        .join('');
  }

  return { title, content, fileType: finalType };
}

function csvToHtmlTable(csv: string): string {
  const lines = csv.trim().split('\n');
  if (!lines.length) return '<p></p>';
  let html = '<table><tbody>';
  lines.forEach((line, rowIndex) => {
    html += '<tr>';
    // Simple CSV parser for quoted and unquoted values
    const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    cells.forEach(cell => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      html += `<${tag}>${escapeHtml(cell)}</${tag}>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^#{6}\s(.+)/gm, '<h6>$1</h6>')
    .replace(/^#{5}\s(.+)/gm, '<h5>$1</h5>')
    .replace(/^#{4}\s(.+)/gm, '<h4>$1</h4>')
    .replace(/^#{3}\s(.+)/gm, '<h3>$1</h3>')
    .replace(/^#{2}\s(.+)/gm, '<h2>$1</h2>')
    .replace(/^#{1}\s(.+)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1"/>')
    .replace(/^[-*+]\s(.+)/gm, '<li>$1</li>')
    .replace(/^\d+\.\s(.+)/gm, '<li>$1</li>')
    .replace(/^>\s(.+)/gm, '<blockquote>$1</blockquote>')
    .replace(/^---+$/gm, '<hr/>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hHblp])(.+)/gm, '<p>$1</p>')
    .replace(/<\/p><p>/g, '</p>\n<p>');
}

export function getExportFormats(fileType: FileType): FileType[] {
  const universalExports: FileType[] = ['html', 'txt', 'md'];
  return universalExports.filter(f => f !== fileType);
}

export function getSupportedImportTypes(): string {
  return '.txt,.md,.markdown,.html,.htm,.rtf,.csv,.json,.js,.ts,.jsx,.tsx,.css,.py,.sql,.xml,.yaml,.yml';
}
