import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { FileType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, yyyy');
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileTypeColor(type: FileType): string {
  const colors: Record<FileType, string> = {
    doc: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
    docx: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
    pdf: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
    txt: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
    md: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400',
    html: 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400',
    rtf: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400',
    xlsx: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
    csv: 'text-teal-600 bg-teal-50 dark:bg-teal-950 dark:text-teal-400',
    opendoc: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400',
    pptx: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
  };
  return colors[type] ?? 'text-gray-600 bg-gray-50';
}

export function getFileTypeLabel(type: FileType): string {
  const labels: Record<FileType, string> = {
    doc: 'Word Document',
    docx: 'Word Document',
    pdf: 'PDF',
    txt: 'Plain Text',
    md: 'Markdown',
    html: 'HTML',
    rtf: 'Rich Text',
    xlsx: 'Spreadsheet',
    csv: 'CSV',
    opendoc: 'OpenDoc Project',
    pptx: 'Presentation',
  };
  return labels[type] ?? type.toUpperCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function extractTextFromHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? '';
}

export function countWords(html: string): number {
  const text = extractTextFromHtml(html);
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function countChars(html: string): number {
  return extractTextFromHtml(html).length;
}

export function generateExcerpt(html: string, length = 120): string {
  const text = extractTextFromHtml(html).trim();
  return truncate(text, length);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
