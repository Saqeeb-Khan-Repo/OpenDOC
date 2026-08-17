// Web Worker for Asynchronous, Non-Blocking Off-Thread Image Optimization

export interface WorkerImageTask {
  id: string;
  blob: Blob;
  mimeType: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface WorkerImageResult {
  id: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  success: boolean;
  error?: string;
}

self.onmessage = async (e: MessageEvent<WorkerImageTask>) => {
  const { id, blob, mimeType, maxWidth = 2560, maxHeight = 2560, quality = 0.85 } = e.data;

  // Pass-through for SVG as vector graphics shouldn't be rasterized
  if (mimeType.includes('svg')) {
    const text = await blob.text();
    const cleanSvg = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*(["'])[\s\S]*?\1/gi, '');
    const cleanBlob = new Blob([cleanSvg], { type: 'image/svg+xml' });
    self.postMessage({
      id,
      blob: cleanBlob,
      width: 800,
      height: 600,
      size: cleanBlob.size,
      mimeType: 'image/svg+xml',
      success: true,
    } as WorkerImageResult);
    return;
  }

  // If small image (< 800KB) and standard dimensions, preserve without heavy re-encoding
  if (blob.size < 800 * 1024) {
    try {
      const bitmap = await createImageBitmap(blob);
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close();

      if (width <= maxWidth && height <= maxHeight) {
        self.postMessage({
          id,
          blob,
          width,
          height,
          size: blob.size,
          mimeType,
          success: true,
        } as WorkerImageResult);
        return;
      }
    } catch {
      // Continue to canvas fallback
    }
  }

  try {
    const bitmap = await createImageBitmap(blob);
    let targetWidth = bitmap.width;
    let targetHeight = bitmap.height;

    // Calculate downscaled dimensions if exceeding limits
    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    // Use OffscreenCanvas for hardware-accelerated processing
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(targetWidth, targetHeight);
      const ctx = canvas.getContext('2d', { alpha: true });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

        // Determine optimal format (preserve PNG transparency, otherwise prefer WebP / JPEG)
        const isPng = mimeType.includes('png');
        const outputMime = isPng ? 'image/png' : 'image/webp';
        const optimizedBlob = await canvas.convertToBlob({
          type: outputMime,
          quality: isPng ? undefined : quality,
        });

        bitmap.close();

        self.postMessage({
          id,
          blob: optimizedBlob,
          width: targetWidth,
          height: targetHeight,
          size: optimizedBlob.size,
          mimeType: outputMime,
          success: true,
        } as WorkerImageResult);
        return;
      }
    }

    // If OffscreenCanvas not available in worker, return original with measured dimensions
    const width = bitmap.width;
    const height = bitmap.height;
    bitmap.close();

    self.postMessage({
      id,
      blob,
      width,
      height,
      size: blob.size,
      mimeType,
      success: true,
    } as WorkerImageResult);
  } catch (err: any) {
    self.postMessage({
      id,
      blob,
      width: 800,
      height: 600,
      size: blob.size,
      mimeType,
      success: false,
      error: err?.message || 'Worker image processing failed',
    } as WorkerImageResult);
  }
};
