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
  isOptimized?: boolean;
}

export interface InstantPreviewAsset {
  assetId: string;
  previewUrl: string;
  name: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

const DB_NAME = 'OpenDocStudioDB';
const DB_VERSION = 2;
const STORE_NAME_IMAGES = 'images';
const STORE_NAME_DOCUMENTS = 'documents';

type AssetListener = (asset: ImageAsset) => void;

export class ImageAssetEngine {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static memoryCache: Map<string, ImageAsset> = new Map();
  private static activeObjectUrls: Map<string, string> = new Map();
  private static listeners: Map<string, Set<AssetListener>> = new Map();
  private static worker: Worker | null = null;
  private static pendingWorkerTasks: Map<
    string,
    { resolve: (res: any) => void; reject: (err: any) => void }
  > = new Map();

  /**
   * Initialize or retrieve the Web Worker instance for off-thread image processing
   */
  private static getWorker(): Worker | null {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;

    if (!this.worker) {
      try {
        this.worker = new Worker(
          new URL('../workers/imageWorker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (e: MessageEvent) => {
          const { id, blob, width, height, size, mimeType, success } = e.data;
          const task = this.pendingWorkerTasks.get(id);
          if (task) {
            this.pendingWorkerTasks.delete(id);
            if (success) {
              task.resolve({ id, blob, width, height, size, mimeType });
            } else {
              task.reject(new Error(e.data.error || 'Worker optimization failed'));
            }
          }
        };

        this.worker.onerror = (err) => {
          console.warn('Image worker encountered an error:', err);
        };
      } catch (err) {
        console.warn('Could not initialize image Web Worker, using fallback:', err);
        this.worker = null;
      }
    }

    return this.worker;
  }

  /**
   * IndexedDB Connection Manager
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

        if (!db.objectStoreNames.contains(STORE_NAME_DOCUMENTS)) {
          const docStore = db.createObjectStore(STORE_NAME_DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          docStore.createIndex('folderId', 'folderId', { unique: false });
          docStore.createIndex('mode', 'mode', { unique: false });
        }

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
   * Subscribe to asset optimization completion events
   */
  static subscribe(assetId: string, callback: AssetListener): () => void {
    if (!this.listeners.has(assetId)) {
      this.listeners.set(assetId, new Set());
    }
    this.listeners.get(assetId)!.add(callback);

    return () => {
      const set = this.listeners.get(assetId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(assetId);
      }
    };
  }

  private static notifyListeners(asset: ImageAsset): void {
    const set = this.listeners.get(asset.id);
    if (set) {
      set.forEach(cb => {
        try {
          cb(asset);
        } catch (err) {
          console.error('Error in asset listener:', err);
        }
      });
    }
  }

  /**
   * INSTANT PREVIEW GENERATION (<2ms)
   * Creates an immediate Blob URL and kicks off background optimization.
   * Never blocks UI, typing, or modal interactions!
   */
  static createInstantAsset(source: File | Blob | string, name = 'Untitled Image'): InstantPreviewAsset {
    const assetId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let previewUrl: string;
    let mimeType = 'image/png';
    let size = 0;
    let blob: Blob;

    if (typeof source === 'string') {
      previewUrl = source;
      if (source.startsWith('data:')) {
        const mimeMatch = source.match(/^data:([^;]+);base64,/);
        if (mimeMatch) mimeType = mimeMatch[1];
        blob = new Blob([source], { type: mimeType });
        size = source.length;
      } else {
        blob = new Blob([source], { type: 'text/plain' });
        size = source.length;
      }
    } else {
      blob = source;
      mimeType = source.type || 'image/png';
      size = source.size;
      previewUrl = URL.createObjectURL(source);
      this.activeObjectUrls.set(assetId, previewUrl);
      if ('name' in source && (source as File).name) {
        name = (source as File).name;
      }
    }

    // Provisional in-memory representation
    const provisional: ImageAsset = {
      id: assetId,
      name,
      blob,
      dataUrl: previewUrl,
      mimeType,
      width: 800,
      height: 600,
      aspectRatio: 800 / 600,
      size,
      createdAt: new Date().toISOString(),
      isOptimized: false,
    };
    this.memoryCache.set(assetId, provisional);

    // Launch background optimization without awaiting
    this.runBackgroundOptimization(assetId, blob, mimeType, name);

    return {
      assetId,
      previewUrl,
      name,
      mimeType,
      size,
      width: 800,
      height: 600,
    };
  }

  /**
   * Background Optimization Pipeline
   * Runs in Web Worker or async OffscreenCanvas, persists to IndexedDB, and notifies listeners.
   */
  private static async runBackgroundOptimization(
    assetId: string,
    rawBlob: Blob,
    mimeType: string,
    name: string
  ): Promise<void> {
    try {
      let optimizedBlob = rawBlob;
      let finalWidth = 800;
      let finalHeight = 600;
      let finalMime = mimeType;

      const worker = this.getWorker();

      if (worker) {
        // Execute inside Web Worker
        const result = await new Promise<any>((resolve, reject) => {
          this.pendingWorkerTasks.set(assetId, { resolve, reject });
          worker.postMessage({
            id: assetId,
            blob: rawBlob,
            mimeType,
            maxWidth: 2560,
            maxHeight: 2560,
            quality: 0.85,
          });
        });

        optimizedBlob = result.blob;
        finalWidth = result.width;
        finalHeight = result.height;
        finalMime = result.mimeType;
      } else {
        // Fallback for environments without Web Worker
        if (typeof window !== 'undefined' && typeof createImageBitmap !== 'undefined') {
          const bitmap = await createImageBitmap(rawBlob);
          finalWidth = bitmap.width;
          finalHeight = bitmap.height;
          bitmap.close();
        }
      }

      // Convert to Base64 dataUrl only when needed for storage or export
      let dataUrl: string;
      if (typeof window !== 'undefined' && (optimizedBlob.size < 2 * 1024 * 1024 || mimeType.includes('svg'))) {
        dataUrl = await this.blobToDataUrl(optimizedBlob);
      } else {
        dataUrl = URL.createObjectURL(optimizedBlob);
        this.activeObjectUrls.set(assetId, dataUrl);
      }

      const optimizedAsset: ImageAsset = {
        id: assetId,
        name,
        blob: optimizedBlob,
        dataUrl,
        mimeType: finalMime,
        width: finalWidth,
        height: finalHeight,
        aspectRatio: finalWidth / (finalHeight || 1),
        size: optimizedBlob.size,
        createdAt: new Date().toISOString(),
        isOptimized: true,
      };

      // Update memory cache
      this.memoryCache.set(assetId, optimizedAsset);

      // Persist to IndexedDB
      try {
        const db = await this.getDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME_IMAGES, 'readwrite');
          const store = tx.objectStore(STORE_NAME_IMAGES);
          const req = store.put({
            id: optimizedAsset.id,
            name: optimizedAsset.name,
            blob: optimizedAsset.blob,
            dataUrl: optimizedAsset.dataUrl,
            mimeType: optimizedAsset.mimeType,
            width: optimizedAsset.width,
            height: optimizedAsset.height,
            aspectRatio: optimizedAsset.aspectRatio,
            size: optimizedAsset.size,
            createdAt: optimizedAsset.createdAt,
          });
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('Could not persist optimized image to IndexedDB:', err);
      }

      // Notify node views that asset is ready/optimized
      this.notifyListeners(optimizedAsset);
    } catch (err) {
      console.warn('Background optimization fell back to raw asset:', err);
    }
  }

  /**
   * Compatibility method: Store image and return ImageAsset
   */
  static async storeImage(
    source: File | Blob | string,
    name = 'Untitled Image'
  ): Promise<ImageAsset> {
    const instant = this.createInstantAsset(source, name);
    return this.memoryCache.get(instant.assetId)!;
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
        if (!asset.dataUrl && asset.blob) {
          asset.dataUrl = URL.createObjectURL(asset.blob);
          this.activeObjectUrls.set(asset.id, asset.dataUrl);
        }
        this.memoryCache.set(id, asset);
        return asset;
      }
    } catch (err) {
      console.warn(`Could not read image asset ${id} from IndexedDB:`, err);
    }

    return null;
  }

  /**
   * Resolve an image src or asset:// URL into a viewable source
   */
  static async resolveSource(src: string): Promise<string> {
    if (!src) return '';
    if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) {
      return src;
    }

    if (src.startsWith('asset://')) {
      const assetId = src.replace('asset://', '');
      const asset = await this.getImage(assetId);
      if (asset) return asset.dataUrl;
    }

    return src;
  }

  /**
   * Resolve all asset URLs in HTML string for Print / Export
   */
  static async resolveHtmlImages(html: string): Promise<string> {
    if (!html) return '';

    const assetMatches = html.match(/src=["'](asset:\/\/[^"']+)["']/g);
    if (!assetMatches) return html;

    let result = html;
    for (const match of assetMatches) {
      const srcUrl = match.replace(/^src=["']|["']$/g, '');
      const resolved = await this.resolveSource(srcUrl);
      if (resolved && resolved !== srcUrl) {
        result = result.split(srcUrl).join(resolved);
      }
    }

    return result;
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
   * Convert Blob to Data URL helper
   */
  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Memory Cleanup: revoke specific Object URL
   */
  static revokeObjectUrl(assetId: string): void {
    const url = this.activeObjectUrls.get(assetId);
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      this.activeObjectUrls.delete(assetId);
    }
  }

  /**
   * Memory Cleanup: revoke all active Object URLs on document unmount
   */
  static cleanupAllObjectUrls(): void {
    this.activeObjectUrls.forEach((url) => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.activeObjectUrls.clear();
  }
}
