import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  Crop, RefreshCw, RotateCw, Trash2, Copy, AlignLeft, AlignCenter,
  AlignRight, Shield, Maximize2, Sparkles, Check, Sliders
} from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';
import { ImageAssetEngine } from '@/engines/ImageAssetEngine';
import { cn } from '@/utils/cn';

export function ResizableImageNode({ node, updateAttributes, deleteNode, selected, editor }: NodeViewProps) {
  const {
    src, alt, title, width, align = 'center',
    borderRadius = '8px', border = 'none', shadow = 'sm', rotate = 0, opacity = 1, imageId
  } = node.attrs;

  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState<string | number>(width || '100%');
  const [activeCorner, setActiveCorner] = useState<'nw' | 'ne' | 'se' | 'sw' | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve persistent asset if needed
  useEffect(() => {
    let isMounted = true;
    if (src && src.startsWith('asset://')) {
      ImageAssetEngine.resolveSource(src).then(resolved => {
        if (isMounted && resolved) setDisplaySrc(resolved);
      });
    } else {
      setDisplaySrc(src);
    }
    return () => { isMounted = false; };
  }, [src]);

  // Handle Corner Resize Drag
  const handleResizeStart = (corner: 'nw' | 'ne' | 'se' | 'sw', e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveCorner(corner);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const initialWidth = imageRef.current ? imageRef.current.offsetWidth : 400;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const deltaX = corner === 'se' || corner === 'ne' ? currentX - clientX : clientX - currentX;
      const newWidth = Math.max(120, Math.min(800, initialWidth + deltaX));
      setCurrentWidth(`${Math.round(newWidth)}px`);
    };

    const onEnd = () => {
      setIsResizing(false);
      setActiveCorner(null);
      if (imageRef.current) {
        updateAttributes({ width: `${imageRef.current.offsetWidth}px` });
      }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  // Replace image from device
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const asset = await ImageAssetEngine.storeImage(file);
    updateAttributes({
      src: asset.dataUrl,
      imageId: asset.id,
      alt: file.name,
    });
    setDisplaySrc(asset.dataUrl);
    e.target.value = '';
  };

  // Duplicate image node
  const handleDuplicate = () => {
    if (editor) {
      editor.commands.insertContent({
        type: 'resizableImage',
        attrs: { ...node.attrs },
      });
    }
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    const nextRotate = ((rotate || 0) + 90) % 360;
    updateAttributes({ rotate: nextRotate });
  };

  // Apply Crop
  const handleApplyCrop = async (croppedDataUrl: string) => {
    const asset = await ImageAssetEngine.storeImage(croppedDataUrl, `${alt || 'Cropped'} (Crop)`);
    updateAttributes({
      src: asset.dataUrl,
      imageId: asset.id,
    });
    setDisplaySrc(asset.dataUrl);
  };

  const getShadowStyle = () => {
    if (shadow === 'lg') return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    if (shadow === 'md') return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    if (shadow === 'sm') return '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    return 'none';
  };

  return (
    <NodeViewWrapper
      className={cn(
        'resizable-image-wrapper my-4 select-none relative group/img-block transition-all',
        align === 'center' ? 'flex justify-center' : align === 'right' ? 'flex justify-end' : 'flex justify-start'
      )}
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div
        className={cn(
          'relative inline-block transition-all rounded-lg',
          selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/40'
        )}
        style={{ width: currentWidth || width || '100%', maxWidth: '100%' }}
      >
        {/* Hidden File Input for Replace */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleReplaceFile}
          className="hidden"
        />

        {/* Floating Canva-Style Context Toolbar when selected */}
        {selected && (
          <div
            className="absolute -top-11 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur border border-border rounded-xl shadow-lg px-2 py-1 flex items-center gap-1 z-30 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Width Presets */}
            <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-0.5">
              {(['25%', '50%', '75%', '100%'] as const).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => { setCurrentWidth(w); updateAttributes({ width: w }); }}
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-muted transition-colors',
                    width === w ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Alignments */}
            <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-0.5">
              <button
                type="button"
                onClick={() => updateAttributes({ align: 'left' })}
                className={cn('p-1 rounded hover:bg-muted', align === 'left' ? 'text-primary bg-primary/10' : 'text-muted-foreground')}
                title="Align Left"
              >
                <AlignLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => updateAttributes({ align: 'center' })}
                className={cn('p-1 rounded hover:bg-muted', align === 'center' ? 'text-primary bg-primary/10' : 'text-muted-foreground')}
                title="Align Center"
              >
                <AlignCenter className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => updateAttributes({ align: 'right' })}
                className={cn('p-1 rounded hover:bg-muted', align === 'right' ? 'text-primary bg-primary/10' : 'text-muted-foreground')}
                title="Align Right"
              >
                <AlignRight className="h-3 w-3" />
              </button>
            </div>

            {/* Crop Button */}
            <button
              type="button"
              onClick={() => setCropModalOpen(true)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
              title="Crop Image"
            >
              <Crop className="h-3.5 w-3.5" />
            </button>

            {/* Replace Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
              title="Replace Image from Device"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
              title="Rotate 90°"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>

            {/* Duplicate Button */}
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
              title="Duplicate Image"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 text-destructive hover:bg-destructive/10 rounded"
              title="Delete Image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* The Image Element */}
        <img
          ref={imageRef}
          src={displaySrc}
          alt={alt || 'Document Image'}
          title={title}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius,
            boxShadow: getShadowStyle(),
            transform: rotate ? `rotate(${rotate}deg)` : undefined,
            opacity,
            display: 'block',
          }}
          className="cursor-pointer max-w-full"
        />

        {/* 4 Corner Resize Handles when Selected */}
        {selected && (
          <>
            <div
              onMouseDown={e => handleResizeStart('nw', e)}
              onTouchStart={e => handleResizeStart('nw', e)}
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-md cursor-nwse-resize z-20"
            />
            <div
              onMouseDown={e => handleResizeStart('ne', e)}
              onTouchStart={e => handleResizeStart('ne', e)}
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-md cursor-nesw-resize z-20"
            />
            <div
              onMouseDown={e => handleResizeStart('sw', e)}
              onTouchStart={e => handleResizeStart('sw', e)}
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-md cursor-nesw-resize z-20"
            />
            <div
              onMouseDown={e => handleResizeStart('se', e)}
              onTouchStart={e => handleResizeStart('se', e)}
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-md cursor-nwse-resize z-20"
            />
          </>
        )}
      </div>

      {/* Interactive Crop Modal */}
      {cropModalOpen && (
        <ImageCropModal
          open={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageSrc={displaySrc}
          onApplyCrop={handleApplyCrop}
        />
      )}
    </NodeViewWrapper>
  );
}
