import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize and subscribe to background asset optimization
  useEffect(() => {
    let isMounted = true;

    // Resolve initial source
    if (src && src.startsWith('asset://')) {
      ImageAssetEngine.resolveSource(src).then(resolved => {
        if (isMounted && resolved) setDisplaySrc(resolved);
      });
    } else {
      setDisplaySrc(src);
    }

    // Subscribe to background optimization completion
    if (imageId) {
      const unsubscribe = ImageAssetEngine.subscribe(imageId, (updatedAsset) => {
        if (isMounted && updatedAsset.dataUrl) {
          setDisplaySrc(updatedAsset.dataUrl);
          setIsOptimizing(false);
        }
      });
      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    return () => { isMounted = false; };
  }, [src, imageId]);

  // Handle Corner Resize Drag (Visual transforms only during drag; commits on release)
  const handleResizeStart = (corner: 'nw' | 'ne' | 'se' | 'sw', e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveCorner(corner);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const initialWidth = imageRef.current ? imageRef.current.offsetWidth : 400;
    let latestWidth = initialWidth;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const deltaX = corner === 'se' || corner === 'ne' ? currentX - clientX : clientX - currentX;
      latestWidth = Math.max(120, Math.min(800, initialWidth + deltaX));
      // Pure visual DOM update during pointer movement - 0 document serialization lag!
      if (imageRef.current) {
        imageRef.current.style.width = `${Math.round(latestWidth)}px`;
      }
      setCurrentWidth(`${Math.round(latestWidth)}px`);
    };

    const onEnd = () => {
      setIsResizing(false);
      setActiveCorner(null);
      updateAttributes({ width: `${Math.round(latestWidth)}px` });

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

  // Instant replacement from device
  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const instant = ImageAssetEngine.createInstantAsset(file);
    updateAttributes({
      src: instant.previewUrl,
      imageId: instant.assetId,
      alt: file.name,
    });
    setDisplaySrc(instant.previewUrl);
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

  // Opacity cycle (1.0 -> 0.8 -> 0.6 -> 0.4 -> 1.0)
  const handleOpacityCycle = () => {
    const nextOpacity = opacity <= 0.4 ? 1 : Number((opacity - 0.2).toFixed(1));
    updateAttributes({ opacity: nextOpacity });
  };

  // Apply visual crop
  const handleApplyCrop = (croppedDataUrl: string) => {
    const instant = ImageAssetEngine.createInstantAsset(croppedDataUrl, 'Cropped Image');
    updateAttributes({
      src: instant.previewUrl,
      imageId: instant.assetId,
    });
    setDisplaySrc(instant.previewUrl);
    setCropModalOpen(false);
  };

  const shadowClass =
    shadow === 'lg' ? 'shadow-xl' :
    shadow === 'md' ? 'shadow-md' :
    shadow === 'sm' ? 'shadow-sm' : '';

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={cn(
        'my-3 relative group/img select-none transition-all',
        align === 'left' ? 'text-left mr-auto' :
        align === 'right' ? 'text-right ml-auto' :
        'text-center mx-auto'
      )}
      style={{
        display: 'flex',
        justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div
        className={cn(
          'relative inline-block transition-shadow',
          selected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
        )}
        style={{
          width: currentWidth,
          maxWidth: '100%',
        }}
      >
        {/* Floating Contextual Toolbar (Canva-style) */}
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
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title="Crop Image"
            >
              <Crop className="h-3 w-3" />
            </button>

            {/* Replace Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title="Replace Image from Device"
            >
              <RefreshCw className="h-3 w-3" />
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title="Rotate 90°"
            >
              <RotateCw className="h-3 w-3" />
            </button>

            {/* Opacity Cycle */}
            <button
              type="button"
              onClick={handleOpacityCycle}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title={`Adjust Opacity (Current: ${Math.round(opacity * 100)}%)`}
            >
              <Sliders className="h-3 w-3" />
            </button>

            {/* Duplicate Button */}
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title="Duplicate Image Node"
            >
              <Copy className="h-3 w-3" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-xs"
              title="Delete Image"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Hidden File Input for Replace */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleReplaceFile}
          className="hidden"
        />

        {/* Main Image View with lazy loading */}
        <img
          ref={imageRef}
          src={displaySrc}
          alt={alt || 'Document Image'}
          title={title}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: borderRadius || '8px',
            opacity: opacity ?? 1,
            transform: rotate ? `rotate(${rotate}deg)` : undefined,
            transition: isResizing ? 'none' : 'transform 0.15s ease, opacity 0.15s ease',
          }}
          className={cn(
            'block object-contain cursor-pointer transition-all',
            shadowClass
          )}
        />

        {/* Corner Resize Handles */}
        {selected && (
          <>
            <div
              onMouseDown={e => handleResizeStart('nw', e)}
              onTouchStart={e => handleResizeStart('nw', e)}
              className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              title="Drag to resize"
            />
            <div
              onMouseDown={e => handleResizeStart('ne', e)}
              onTouchStart={e => handleResizeStart('ne', e)}
              className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              title="Drag to resize"
            />
            <div
              onMouseDown={e => handleResizeStart('sw', e)}
              onTouchStart={e => handleResizeStart('sw', e)}
              className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              title="Drag to resize"
            />
            <div
              onMouseDown={e => handleResizeStart('se', e)}
              onTouchStart={e => handleResizeStart('se', e)}
              className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              title="Drag to resize"
            />

            {/* Resize Tooltip */}
            {isResizing && imageRef.current && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded shadow">
                {imageRef.current.offsetWidth} × {imageRef.current.offsetHeight} px
              </div>
            )}
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
