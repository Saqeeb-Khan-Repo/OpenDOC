import { StudioDocument } from './types';

const DB_NAME = 'OpenDocStudioDB';
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
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save or update document in IndexedDB
   */
  static async saveDocument(doc: StudioDocument): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(doc);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      // Fallback to localStorage
      try {
        localStorage.setItem(`opendoc_${doc.id}`, JSON.stringify(doc));
      } catch (err) {
        console.error('Failed to save to localStorage fallback:', err);
      }
    }
  }

  /**
   * Load single document by ID
   */
  static async getDocument(id: string): Promise<StudioDocument | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      // Fallback
      const raw = localStorage.getItem(`opendoc_${id}`);
      return raw ? JSON.parse(raw) : null;
    }
  }

  /**
   * Load all saved documents
   */
  static async getAllDocuments(): Promise<StudioDocument[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      const docs: StudioDocument[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('opendoc_')) {
          try {
            docs.push(JSON.parse(localStorage.getItem(key) || ''));
          } catch (err) {}
        }
      }
      return docs;
    }
  }

  /**
   * Delete document by ID
   */
  static async deleteDocument(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      localStorage.removeItem(`opendoc_${id}`);
    }
  }
}
