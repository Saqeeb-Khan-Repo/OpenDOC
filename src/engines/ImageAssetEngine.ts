export interface ImageAsset {
  id: string;
  name: string;
  blob: Blob;
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  size: number;
  createdAt: string;
}

const DB_NAME = 'OpenDocStudioDB';
const DB_VERSION = 2; // Incremented for image assets store
const STORE_NAME_IMAGES = 'images';
const STORE_NAME_DOCUMENTS = 'documents';

export class ImageAssetEngine {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static memoryCache: Map<string, ImageAsset> = new Map();

  /**
   * Get or initialize IndexedDB instance
   */
  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Ensure documents store exists
        if (!db.objectStoreNames.contains(STORE_NAME_DOCUMENTS)) {
          const docStore = db.createObjectStore(STORE_NAME_DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          docStore.createIndex('folderId', 'folderId', { unique: false });
          docStore.createIndex('mode', 'mode', { unique: false });
        }

        // Ensure images store exists
        if (!db.objectStoreNames.contains(STORE_NAME_IMAGES)) {
          const imgStore = db.createObjectStore(STORE_NAME_IMAGES, { keyPath: 'id' });
          imgStore.createIndex('createdAt', 'createdAt', { unique: false });
          imgStore.createIndex('mimeType', 'mimeType', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Sanitize SVG strings against XSS before storage/rendering
   */
  static sanitizeSvg(svgText: string): string {
    return svgText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*(["'])[\s\S]*?\1/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
      .replace(/javascript\s*:/gi, 'about:blank');
  }

  /**
   * Read natural dimensions from an image source
   */
  static async getImageDimensions(src: string): Promise<{ width: number; height: number; aspectRatio: number }> {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return { width: 800, height: 600, aspectRatio: 800 / 600 };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 600;
        const aspectRatio = width / (height || 1);
        resolve({ width, height, aspectRatio });
      };
      img.onerror = () => {
        // Fallback dimensions
        resolve({ width: 800, height: 600, aspectRatio: 800 / 600 });
      };
      img.src = src;
    });
  }

  /**
   * Calculate proportional fitting dimensions to stay inside max container boundaries
   */
  static calculateFitDimensions(
    naturalWidth: number,
    naturalHeight: number,
    maxWidth = 720,
    maxHeight = 600
  ): { width: number; height: number } {
    let w = naturalWidth;
    let h = naturalHeight;

    if (w > maxWidth) {
      const ratio = maxWidth / w;
      w = maxWidth;
      h = Math.round(h * ratio);
    }

    if (h > maxHeight) {
      const ratio = maxHeight / h;
      h = maxHeight;
      w = Math.round(w * ratio);
    }

    return { width: Math.max(40, w), height: Math.max(40, h) };
  }

  /**
   * Store an image (from File, Blob, or DataURL) into persistent IndexedDB and memory cache
   */
  static async storeImage(
    source: File | Blob | string,
    name = 'Untitled Image'
  ): Promise<ImageAsset> {
    let blob: Blob;
    let dataUrl: string;
    let mimeType = 'image/png';
    let size = 0;

    if (typeof source === 'string') {
      if (source.startsWith('data:')) {
        dataUrl = source;
        const mimeMatch = source.match(/^data:([^;]+);base64,/);
        if (mimeMatch) mimeType = mimeMatch[1];
        // Convert dataUrl to blob
        const res = await fetch(source);
        blob = await res.blob();
        size = blob.size;
      } else {
        // External URL - fetch to convert to persistent local blob
        try {
          const res = await fetch(source);
          blob = await res.blob();
          mimeType = blob.type || 'image/png';
          size = blob.size;
          dataUrl = await this.blobToDataUrl(blob);
        } catch {
          // If CORS fails, use source as fallback dataUrl
          dataUrl = source;
          blob = new Blob([source], { type: 'text/plain' });
          size = source.length;
        }
      }
    } else {
      // File or Blob
      blob = source;
      mimeType = source.type || 'image/png';
      size = source.size;
      dataUrl = await this.blobToDataUrl(blob);
      if ('name' in source && (source as File).name) {
        name = (source as File).name;
      }
    }

    // Sanitize if SVG
    if (mimeType.includes('svg')) {
      const text = await blob.text();
      const clean = this.sanitizeSvg(text);
      blob = new Blob([clean], { type: 'image/svg+xml' });
      dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(clean)}`;
    }

    // Determine natural dimensions
    const { width, height, aspectRatio } = await this.getImageDimensions(dataUrl);

    const assetId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const asset: ImageAsset = {
      id: assetId,
      name,
      blob,
      dataUrl,
      mimeType,
      width,
      height,
      aspectRatio,
      size,
      createdAt: new Date().toISOString(),
    };

    // Cache in memory
    this.memoryCache.set(assetId, asset);

    // Save to IndexedDB
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME_IMAGES, 'readwrite');
        const store = tx.objectStore(STORE_NAME_IMAGES);
        const req = store.put({
          id: asset.id,
          name: asset.name,
          blob: asset.blob,
          dataUrl: asset.dataUrl,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height,
          aspectRatio: asset.aspectRatio,
          size: asset.size,
          createdAt: asset.createdAt,
        });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Could not persist image to IndexedDB, using memory cache:', err);
    }

    return asset;
  }

  /**
   * Retrieve an image asset by ID from memory cache or IndexedDB
   */
  static async getImage(id: string): Promise<ImageAsset | null> {
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id)!;
    }

    try {
      const db = await this.getDB();
      const asset = await new Promise<ImageAsset | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME_IMAGES, 'readonly');
        const store = tx.objectStore(STORE_NAME_IMAGES);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (asset) {
        // If dataUrl was lost or needs recreation from blob
        if (!asset.dataUrl && asset.blob) {
          asset.dataUrl = await this.blobToDataUrl(asset.blob);
        }
        this.memoryCache.set(id, asset);
        return asset;
      }
    } catch (err) {
      console.warn('Error reading image asset from IndexedDB:', err);
    }

    return null;
  }

  /**
   * Resolve any asset reference (e.g. "asset://img_123" or dataUrl) into a valid base64 dataUrl
   */
  static async resolveSource(source: string): Promise<string> {
    if (!source) return '';
    if (source.startsWith('asset://')) {
      const id = source.replace('asset://', '');
      const asset = await this.getImage(id);
      return asset ? asset.dataUrl : source;
    }
    return source;
  }

  /**
   * Scan HTML string and replace any asset:// image references with renderable data URLs
   */
  static async resolveHtmlImages(html: string): Promise<string> {
    if (!html || !html.includes('asset://')) return html;

    const regex = /asset:\/\/(img_[a-zA-Z0-9_]+)/g;
    const matches = Array.from(html.matchAll(regex));
    let resolved = html;

    for (const match of matches) {
      const full = match[0];
      const id = match[1];
      const asset = await this.getImage(id);
      if (asset && asset.dataUrl) {
        resolved = resolved.split(full).join(asset.dataUrl);
      }
    }

    return resolved;
  }

  /**
   * Helper: Convert Blob to Data URL
   */
  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}
