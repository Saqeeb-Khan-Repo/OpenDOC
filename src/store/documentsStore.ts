import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Document, FileType, EditorMode } from '@/types';
import { countWords, countChars } from '@/utils/cn';
import { PageEngine } from '@/engines/PageEngine';
import { PresentationEngine, PRESENTATION_THEMES } from '@/engines/PresentationEngine';
import { ElementEngine } from '@/engines/ElementEngine';
import { LocalStorageEngine } from '@/engines/LocalStorageEngine';
import { StudioDocument } from '@/engines/types';

interface DocumentsState {
  documents: Document[];
  // CRUD
  createDocument: (opts?: {
    title?: string;
    content?: string;
    folderId?: string | null;
    fileType?: FileType;
    mode?: EditorMode;
    initialData?: Partial<Document>;
  }) => Document;
  updateDocument: (id: string, patch: Partial<Omit<Document, 'id' | 'createdAt'>>) => void;
  deleteDocument: (id: string) => void;
  restoreDocument: (id: string) => void;
  permanentlyDeleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => Document | null;
  toggleStar: (id: string) => void;
  // Getters
  getDocument: (id: string) => Document | undefined;
  getDocumentsByFolder: (folderId: string | null) => Document[];
  getStarredDocuments: () => Document[];
  getRecentDocuments: (limit?: number) => Document[];
  getTrashedDocuments: () => Document[];
  getActiveDocuments: () => Document[];
  searchDocuments: (query: string) => Document[];
}

const DEFAULT_CONTENT = '<p>Start writing your document...</p>';

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],

      createDocument: (opts = {}) => {
        const now = new Date().toISOString();
        const mode: EditorMode = opts.mode || opts.initialData?.mode || 'document';
        const content = opts.content ?? opts.initialData?.content ?? DEFAULT_CONTENT;

        const doc: Document = {
          id: uuidv4(),
          title: opts.title ?? opts.initialData?.title ?? (mode === 'presentation' ? 'Untitled Presentation' : mode === 'design' ? 'Untitled Visual Design' : 'Untitled Document'),
          content,
          folderId: opts.folderId ?? opts.initialData?.folderId ?? null,
          fileType: opts.fileType ?? (mode === 'presentation' ? 'pptx' : 'doc'),
          isStarred: false,
          wordCount: countWords(content),
          charCount: countChars(content),
          paragraphCount: 1,
          pageCount: 1,
          tags: opts.initialData?.tags ?? [],
          createdAt: now,
          updatedAt: now,
          deletedAt: null,

          // Multi-mode state
          mode,
          pageSettings: opts.initialData?.pageSettings || PageEngine.createDefaultSettings(),
          coverPageData: opts.initialData?.coverPageData,
          references: opts.initialData?.references || [],
          figures: opts.initialData?.figures || [],

          slides: opts.initialData?.slides || [
            PresentationEngine.createSlide('title', PRESENTATION_THEMES[0]),
            PresentationEngine.createSlide('title-content', PRESENTATION_THEMES[0]),
          ],
          activeSlideIndex: 0,
          presentationSettings: opts.initialData?.presentationSettings || PresentationEngine.createDefaultSettings(),

          designElements: opts.initialData?.designElements || [
            ElementEngine.createElement('text', {
              transform: { x: 60, y: 60, width: 400, height: 80, rotation: 0 },
              content: '<h1 style="font-size: 28px; font-weight: bold; color: #1e3a8a;">Visual Canvas</h1>',
            }),
          ],
          canvasWidth: opts.initialData?.canvasWidth || 800,
          canvasHeight: opts.initialData?.canvasHeight || 600,
          canvasBackground: opts.initialData?.canvasBackground || '#FFFFFF',
          ...opts.initialData,
        };

        set(state => ({ documents: [doc, ...state.documents] }));
        LocalStorageEngine.saveDocument(doc as unknown as StudioDocument);
        return doc;
      },

      updateDocument: (id, patch) => {
        set(state => {
          const docs = state.documents.map(doc => {
            if (doc.id !== id) return doc;
            const updated = { ...doc, ...patch, updatedAt: new Date().toISOString() };
            if (patch.content !== undefined) {
              updated.wordCount = countWords(patch.content);
              updated.charCount = countChars(patch.content);
            }
            LocalStorageEngine.saveDocument(updated as unknown as StudioDocument);
            return updated;
          });
          return { documents: docs };
        });
      },

      deleteDocument: (id) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id ? { ...doc, deletedAt: new Date().toISOString() } : doc
          ),
        }));
      },

      restoreDocument: (id) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id ? { ...doc, deletedAt: null, updatedAt: new Date().toISOString() } : doc
          ),
        }));
      },

      permanentlyDeleteDocument: (id) => {
        LocalStorageEngine.deleteDocument(id);
        set(state => ({
          documents: state.documents.filter(doc => doc.id !== id),
        }));
      },

      duplicateDocument: (id) => {
        const original = get().documents.find(d => d.id === id);
        if (!original) return null;
        const now = new Date().toISOString();
        const copy: Document = {
          ...original,
          id: uuidv4(),
          title: `${original.title} (Copy)`,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          isStarred: false,
        };
        set(state => ({ documents: [copy, ...state.documents] }));
        LocalStorageEngine.saveDocument(copy as unknown as StudioDocument);
        return copy;
      },

      toggleStar: (id) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id ? { ...doc, isStarred: !doc.isStarred, updatedAt: new Date().toISOString() } : doc
          ),
        }));
      },

      getDocument: (id) => get().documents.find(d => d.id === id),

      getDocumentsByFolder: (folderId) =>
        get().documents.filter(d => d.folderId === folderId && !d.deletedAt),

      getStarredDocuments: () =>
        get().documents.filter(d => d.isStarred && !d.deletedAt),

      getRecentDocuments: (limit = 10) =>
        get()
          .documents
          .filter(d => !d.deletedAt)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit),

      getTrashedDocuments: () =>
        get().documents.filter(d => d.deletedAt !== null),

      getActiveDocuments: () =>
        get().documents.filter(d => !d.deletedAt),

      searchDocuments: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return get().documents.filter(d => {
          if (d.deletedAt) return false;
          if (d.title.toLowerCase().includes(q)) return true;
          const text = (d.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
          return text.includes(q);
        });
      },
    }),
    {
      name: 'opendoc-studio-documents',
      version: 2,
    }
  )
);
