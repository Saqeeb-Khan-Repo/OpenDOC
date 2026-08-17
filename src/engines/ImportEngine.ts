import JSZip from 'jszip';
import { StudioDocument, PageSettings } from './types';
import { PageEngine } from './PageEngine';
import { OCREngine } from './OCREngine';

export interface ImportResult {
  title: string;
  content: string;
  fileType: string;
  pageSettings?: Partial<PageSettings>;
  parsedDoc?: Partial<StudioDocument>;
}

export class ImportEngine {
  /** Maximum safe client-side parsing size: 50 MB */
  public static readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

  /**
   * Parse uploaded file to HTML and document metadata
   */
  static async parseFile(file: File): Promise<ImportResult> {
    if (!file) {
      throw new Error('No file provided');
    }

    const filename = file.name || 'document';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Untitled Document';

    // 0. Safety Checks: Size & Empty File
    if (file.size === 0) {
      return {
        title,
        content: '<p></p>',
        fileType: ext || 'txt',
      };
    }

    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File is too large (${Math.round(file.size / (1024 * 1024))} MB). Maximum supported file size is 50 MB.`);
    }

    // 1. DOCX Import (Zip XML Unpack & Semantic Extraction)
    if (ext === 'docx') {
      try {
        const content = await this.parseDocx(file);
        return {
          title,
          content,
          fileType: 'docx',
          pageSettings: PageEngine.createDefaultSettings(),
        };
      } catch (err) {
        console.warn('DOCX zip parse failed, falling back to text stream:', err);
        try {
          const text = await file.text();
          return {
            title,
            content: `<p>${this.escapeHtml(text.replace(/\0/g, ''))}</p>`,
            fileType: 'docx',
          };
        } catch {
          return {
            title,
            content: '<p>Document imported with unsupported binary structure.</p>',
            fileType: 'docx',
          };
        }
      }
    }

    // 2. OCR Image Scanner (.png, .jpg, .jpeg, .webp, .tiff, .bmp)
    if (['png', 'jpg', 'jpeg', 'webp', 'tiff', 'bmp'].includes(ext)) {
      try {
        const ocr = await OCREngine.scanDocument(file);
        return {
          title: ocr.title || title,
          content: ocr.htmlContent || '<p></p>',
          fileType: ext,
        };
      } catch (ocrErr) {
        console.warn('OCR scanning fallback:', ocrErr);
        return {
          title,
          content: `<p><img src="${URL.createObjectURL(file)}" alt="${this.escapeHtml(title)}" style="max-width: 100%;" /></p>`,
          fileType: ext,
        };
      }
    }

    // 3. DocFlow / OpenDoc / JSON Import
    if (ext === 'docflow' || ext === 'opendoc' || ext === 'json') {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') {
          return {
            title: parsed.title || title,
            content: parsed.content || '',
            fileType: 'json',
            parsedDoc: parsed,
          };
        }
      } catch (e) {
        console.warn('Failed to parse JSON file:', e);
      }
    }

    // 4. Markdown Import (.md, .markdown)
    if (ext === 'md' || ext === 'markdown') {
      try {
        const text = await file.text();
        const content = this.markdownToHtml(text);
        return { title, content, fileType: 'md' };
      } catch (e) {
        console.warn('Markdown parsing fallback:', e);
      }
    }

    // 5. HTML Import (.html, .htm)
    if (ext === 'html' || ext === 'htm') {
      try {
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const bodyHtml = doc.body.innerHTML || text;
        return { title, content: bodyHtml, fileType: 'html' };
      } catch (e) {
        console.warn('HTML parsing fallback:', e);
      }
    }

    // 6. RTF Import (.rtf)
    if (ext === 'rtf') {
      try {
        const text = await file.text();
        const content = this.parseRtf(text);
        return { title, content, fileType: 'rtf' };
      } catch (e) {
        console.warn('RTF parsing fallback:', e);
      }
    }

    // 7. CSV Import (.csv)
    if (ext === 'csv') {
      try {
        const text = await file.text();
        const content = this.csvToHtmlTable(text);
        return { title, content, fileType: 'csv' };
      } catch (e) {
        console.warn('CSV parsing fallback:', e);
      }
    }

    // 8. Plain Text & Source Code (.txt, .js, .ts, etc.)
    try {
      const text = await file.text();
      const paragraphs = text
        .split(/\n\n+/)
        .map(p => `<p>${this.escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
        .join('\n');

      return {
        title,
        content: paragraphs || '<p></p>',
        fileType: 'txt',
      };
    } catch {
      return {
        title,
        content: '<p></p>',
        fileType: 'txt',
      };
    }
  }

  /**
   * Parse DOCX by extracting word/document.xml with JSZip
   */
  private static async parseDocx(file: File): Promise<string> {
    const zip = new JSZip();
    const zipDoc = await zip.loadAsync(file);

    const docXmlFile = zipDoc.file('word/document.xml');
    if (!docXmlFile) {
      throw new Error('Invalid DOCX: word/document.xml not found');
    }

    const xmlText = await docXmlFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    let html = '';

    // Iterate over top-level body children (paragraphs <w:p> and tables <w:tbl>)
    const body = xmlDoc.getElementsByTagName('w:body')[0];
    if (!body) return '<p>Empty Document</p>';

    for (let i = 0; i < body.childNodes.length; i++) {
      const node = body.childNodes[i] as Element;
      if (!node.tagName) continue;

      if (node.tagName === 'w:p') {
        html += this.parseDocxParagraph(node);
      } else if (node.tagName === 'w:tbl') {
        html += this.parseDocxTable(node);
      }
    }

    return html || '<p>Imported document contains no text.</p>';
  }

  /**
   * Parse a single <w:p> paragraph node
   */
  private static parseDocxParagraph(pNode: Element): string {
    let pText = '';
    let isHeading = false;
    let headingLevel = 1;
    let isBullet = false;

    // Check paragraph style / outline
    const pStyle = pNode.getElementsByTagName('w:pStyle')[0];
    if (pStyle) {
      const val = pStyle.getAttribute('w:val') || '';
      if (/^Heading(\d)/i.test(val)) {
        isHeading = true;
        headingLevel = Math.min(4, parseInt(val.match(/\d/)?.[0] || '1', 10));
      } else if (/ListBullet|ListParagraph/i.test(val)) {
        isBullet = true;
      }
    }

    // Iterate child runs <w:r>
    const runs = pNode.getElementsByTagName('w:r');
    for (let j = 0; j < runs.length; j++) {
      const run = runs[j];
      let runText = '';
      const textNodes = run.getElementsByTagName('w:t');
      for (let k = 0; k < textNodes.length; k++) {
        runText += textNodes[k].textContent || '';
      }

      if (!runText) continue;

      let formatted = this.escapeHtml(runText);
      const isBold = run.getElementsByTagName('w:b').length > 0;
      const isItalic = run.getElementsByTagName('w:i').length > 0;
      const isUnderline = run.getElementsByTagName('w:u').length > 0;

      if (isBold) formatted = `<strong>${formatted}</strong>`;
      if (isItalic) formatted = `<em>${formatted}</em>`;
      if (isUnderline) formatted = `<u>${formatted}</u>`;

      pText += formatted;
    }

    if (!pText.trim()) return '';

    if (isHeading) {
      return `<h${headingLevel}>${pText}</h${headingLevel}>\n`;
    }
    if (isBullet) {
      return `<li>${pText}</li>\n`;
    }
    return `<p>${pText}</p>\n`;
  }

  /**
   * Parse a single <w:tbl> table node
   */
  private static parseDocxTable(tblNode: Element): string {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">\n<tbody>\n';
    const rows = tblNode.getElementsByTagName('w:tr');

    for (let r = 0; r < rows.length; r++) {
      tableHtml += '  <tr style="border-bottom: 1px solid #e2e8f0;">\n';
      const cells = rows[r].getElementsByTagName('w:tc');
      for (let c = 0; c < cells.length; c++) {
        let cellText = '';
        const paragraphs = cells[c].getElementsByTagName('w:p');
        for (let p = 0; p < paragraphs.length; p++) {
          cellText += this.parseDocxParagraph(paragraphs[p]);
        }
        const tag = r === 0 ? 'th' : 'td';
        const bg = r === 0 ? 'background: #f8fafc; font-weight: bold;' : '';
        tableHtml += `    <${tag} style="border: 1px solid #cbd5e1; padding: 8px 12px; ${bg}">${cellText || '&nbsp;'}</${tag}>\n`;
      }
      tableHtml += '  </tr>\n';
    }

    tableHtml += '</tbody>\n</table>\n';
    return tableHtml;
  }

  /**
   * Basic RTF Parser
   */
  private static parseRtf(rtf: string): string {
    const stripped = rtf
      .replace(/\{\\fonttbl[\s\S]*?\}/g, '')
      .replace(/\{\\colortbl[\s\S]*?\}/g, '')
      .replace(/\{\\\*[\s\S]*?\}/g, '')
      .replace(/\\par[d]?\s*/gi, '\n\n')
      .replace(/\\b\s+(.*?)\\b0\s*/gi, '<strong>$1</strong>')
      .replace(/\\i\s+(.*?)\\i0\s*/gi, '<em>$1</em>')
      .replace(/\\ul\s+(.*?)\\ulnone\s*/gi, '<u>$1</u>')
      .replace(/\\line\s*/gi, '<br/>')
      .replace(/\\[a-z0-9]+\s?/gi, '')
      .replace(/[{}]/g, '')
      .trim();

    return stripped
      .split(/\n\n+/)
      .filter(Boolean)
      .map(p => `<p>${p.trim()}</p>`)
      .join('\n');
  }

  private static csvToHtmlTable(csv: string): string {
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return '<p></p>';
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">\n<tbody>\n';
    lines.forEach((line, rowIndex) => {
      html += '  <tr style="border-bottom: 1px solid #e2e8f0;">\n';
      const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
      cells.forEach(cell => {
        const tag = rowIndex === 0 ? 'th' : 'td';
        const bg = rowIndex === 0 ? 'background: #f8fafc; font-weight: bold;' : '';
        html += `    <${tag} style="border: 1px solid #cbd5e1; padding: 8px 12px; ${bg}">${this.escapeHtml(cell)}</${tag}>\n`;
      });
      html += '  </tr>\n';
    });
    html += '</tbody>\n</table>\n';
    return html;
  }

  private static markdownToHtml(md: string): string {
    return md
      .replace(/^#{6}\s(.+)/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s(.+)/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s(.+)/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s(.+)/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s(.+)/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s(.+)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<s>$1</s>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/^[-*+]\s(.+)/gm, '<li>$1</li>')
      .replace(/^\d+\.\s(.+)/gm, '<li>$1</li>')
      .replace(/^>\s(.+)/gm, '<blockquote>$1</blockquote>')
      .replace(/^---+$/gm, '<hr/>')
      .replace(/\n\n/g, '</p>\n<p>')
      .replace(/^(?!<[hHblp])(.+)/gm, '<p>$1</p>');
  }

  private static escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
