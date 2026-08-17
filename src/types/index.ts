import {
  EditorMode,
  PageSettings,
  CoverPageData,
  ReferenceItem,
  FigureItem,
  Slide,
  PresentationSettings,
  CanvasElement,
} from '@/engines/types';

export type FileType = 'doc' | 'docx' | 'pdf' | 'txt' | 'md' | 'html' | 'rtf' | 'xlsx' | 'csv' | 'opendoc' | 'pptx';

export type DocumentStatus = 'draft' | 'published' | 'archived';

export interface Document {
  id: string;
  title: string;
  content: string; // HTML
  folderId: string | null;
  fileType: FileType;
  isStarred: boolean;
  wordCount: number;
  charCount: number;
  paragraphCount?: number;
  pageCount?: number;
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deletedAt: string | null; // soft delete
  thumbnail?: string;

  // OpenDoc Studio Multi-Mode Extensions
  mode?: EditorMode;
  pageSettings?: PageSettings;
  coverPageData?: CoverPageData;
  references?: ReferenceItem[];
  figures?: FigureItem[];
  slides?: Slide[];
  activeSlideIndex?: number;
  presentationSettings?: PresentationSettings;
  designElements?: CanvasElement[];
  canvasWidth?: number;
  canvasHeight?: number;
  canvasBackground?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'title' | 'updatedAt' | 'createdAt' | 'fileType';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface SearchResult {
  type: 'document' | 'folder';
  id: string;
  title: string;
  excerpt?: string;
  folderId?: string | null;
  updatedAt?: string;
  fileType?: FileType;
  mode?: EditorMode;
}

export interface AppSettings {
  theme: ThemeMode;
  compactSidebar: boolean;
  defaultView: ViewMode;
  autosaveDelay: number;
  spellcheck: boolean;
  showWordCount: boolean;
  defaultFont: string;
  defaultPageSize: string;
}

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  description: string;
  content: string; // HTML
  icon: string;
  color: string;
}

export type TemplateCategory =
  | 'resume'
  | 'cover-letter'
  | 'business'
  | 'education'
  | 'project'
  | 'research'
  | 'meeting'
  | 'invoice'
  | 'proposal'
  | 'legal'
  | 'personal'
  | 'presentation'
  | 'design';

export interface ConversionJob {
  id: string;
  documentId: string;
  documentTitle: string;
  fromFormat: FileType;
  toFormat: FileType;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

export * from '@/engines/types';
