import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Crop, Check, X, RotateCw, ZoomIn, ZoomOut, Maximize2, Sparkles, RefreshCw
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCrop: (croppedDataUrl: string) => void;
}

type AspectRatioOption = 'free' | '1:1' | '4:3' | '16:9' | '3:2';

export function ImageCropModal({
  open,
  onClose,
  imageSrc,
  onApplyCrop,
}: ImageCropModalProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [zoom, setZoom] = useState(1);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentage bounds
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startBox: { x: 10, y: 10, width: 80, height: 80 } });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setAspectRatio('free');
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    }
  }, [open, imageSrc]);

  const handleAspectRatioSelect = (ratio: AspectRatioOption) => {
    setAspectRatio(ratio);
    if (ratio === '1:1') {
      setCropBox({ x: 15, y: 15, width: 70, height: 70 });
    } else if (ratio === '16:9') {
      setCropBox({ x: 5, y: 20, width: 90, height: 50 });
    } else if (ratio === '4:3') {
      setCropBox({ x: 10, y: 15, width: 80, height: 60 });
    } else if (ratio === '3:2') {
      setCropBox({ x: 10, y: 18, width: 80, height: 53 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startBox: { ...cropBox },
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPct = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPct = ((e.clientY - dragStart.y) / rect.height) * 100;

    let newX = dragStart.startBox.x + deltaXPct;
    let newY = dragStart.startBox.y + deltaYPct;

    newX = Math.max(0, Math.min(100 - dragStart.startBox.width, newX));
    newY = Math.max(0, Math.min(100 - dragStart.startBox.height, newY));

    setCropBox(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePerformCrop = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const cropPixelX = (cropBox.x / 100) * naturalW;
      const cropPixelY = (cropBox.y / 100) * naturalH;
      const cropPixelW = (cropBox.width / 100) * naturalW;
      const cropPixelH = (cropBox.height / 100) * naturalH;

      canvas.width = Math.max(1, cropPixelW);
      canvas.height = Math.max(1, cropPixelH);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          img,
          cropPixelX, cropPixelY, cropPixelW, cropPixelH,
          0, 0, canvas.width, canvas.height
        );
        const croppedUrl = canvas.toDataURL('image/png', 0.95);
        onApplyCrop(croppedUrl);
        onClose();
      }
    };
    img.src = imageSrc;
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[620px] p-5 text-xs max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Crop className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Crop Image</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Drag the crop window or pick an aspect ratio preset.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Aspect Ratio Presets */}
        <div className="flex items-center justify-between gap-2 bg-muted/60 p-2 rounded-xl border border-border mt-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
            Ratio:
          </span>
          <div className="flex items-center gap-1">
            {(['free', '1:1', '4:3', '16:9', '3:2'] as AspectRatioOption[]).map(r => (
              <Button
                key={r}
                type="button"
                variant={aspectRatio === r ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs px-2.5 capitalize"
                onClick={() => handleAspectRatioSelect(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        {/* Crop Viewport */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative h-72 sm:h-80 bg-black/90 rounded-xl overflow-hidden flex items-center justify-center select-none border border-border my-2 cursor-crosshair"
        >
          {/* Base Image */}
          <img
            src={imageSrc}
            alt="To crop"
            style={{
              transform: `scale(${zoom})`,
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              opacity: 0.6,
            }}
            className="pointer-events-none"
          />

          {/* Dimmed Overlay & Active Crop Box */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: 'absolute',
              left: `${cropBox.x}%`,
              top: `${cropBox.y}%`,
              width: `${cropBox.width}%`,
              height: `${cropBox.height}%`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            className="border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-sm"
          >
            {/* Grid Lines inside crop box */}
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-white/30" />
              <div className="border-r border-white/30" />
              <div />
            </div>

            {/* Corner Handles */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-xs" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-xs" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-xs" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-xs" />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
          <span>Drag window to frame crop</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
              className="p-1 hover:text-foreground"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="font-mono text-[11px]">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(3, z + 0.2))}
              className="p-1 hover:text-foreground"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t border-border mt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handlePerformCrop}
            className="gap-1.5 bg-primary font-semibold text-primary-foreground shadow-xs"
          >
            <Check className="h-3.5 w-3.5" /> Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
