import { StudioDocument } from './types';

const DB_NAME = 'DocFlowStudioDB';
const OLD_DB_NAME = 'OpenDocStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

export class LocalStorageEngine {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('folderId', 'folderId', { unique: false });
          store.createIndex('mode', 'mode', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('IndexedDB open error'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Save or update document in IndexedDB with safe fallback to localStorage
   */
  static async saveDocument(doc: StudioDocument): Promise<void> {
    if (!doc || !doc.id) return;

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(doc);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('IndexedDB put error'));
      });
    } catch {
      // Fallback to localStorage with quota overflow protection
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(`docflow_${doc.id}`, JSON.stringify(doc));
        }
      } catch (err) {
        console.warn('LocalStorage save quota exceeded or unavailable:', err);
      }
    }
  }

  /**
   * Load single document by ID with fallback & corruption recovery
   */
  static async getDocument(id: string): Promise<StudioDocument | null> {
    if (!id) return null;

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error('IndexedDB get error'));
      });
    } catch {
      // Fallback to localStorage (check both new and legacy prefixes)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = localStorage.getItem(`docflow_${id}`) || localStorage.getItem(`opendoc_${id}`);
          if (raw) {
            return JSON.parse(raw);
          }
        } catch (e) {
          console.warn('Failed to parse corrupted document from localStorage:', e);
        }
      }
      return null;
    }
  }

  /**
   * Load all saved documents across IndexedDB and localStorage
   */
  static async getAllDocuments(): Promise<StudioDocument[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error || new Error('IndexedDB getAll error'));
      });
    } catch {
      const docs: StudioDocument[] = [];
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('docflow_') || key.startsWith('opendoc_'))) {
            try {
              const item = localStorage.getItem(key);
              if (item) {
                const parsed = JSON.parse(item);
                if (parsed && typeof parsed === 'object' && parsed.id) {
                  docs.push(parsed);
                }
              }
            } catch (err) {
              console.warn('Skipping corrupted item in localStorage:', key, err);
            }
          }
        }
      }
      return docs;
    }
  }

  /**
   * Delete document by ID
   */
  static async deleteDocument(id: string): Promise<void> {
    if (!id) return;

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('IndexedDB delete error'));
      });
    } catch {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.removeItem(`docflow_${id}`);
          localStorage.removeItem(`opendoc_${id}`);
        } catch {}
      }
    }
  }
}
