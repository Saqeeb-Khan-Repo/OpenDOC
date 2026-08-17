import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload, Camera, Link as LinkIcon, Image as ImageIcon,
  Check, X, Sparkles, Sliders, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { ImageAssetEngine, InstantPreviewAsset } from '@/engines/ImageAssetEngine';
import { cn } from '@/utils/cn';

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onInsertImage: (imageData: {
    src: string;
    imageId?: string;
    alt?: string;
    title?: string;
    width?: string;
    align?: string;
  }) => void;
  isReplacing?: boolean;
}

export function ImageUploadModal({
  open,
  onClose,
  onInsertImage,
  isReplacing = false,
}: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [currentInstant, setCurrentInstant] = useState<InstantPreviewAsset | null>(null);
  const [altText, setAltText] = useState('');
  const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [maxWidthPercent, setMaxWidthPercent] = useState('100');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Reset state on modal open
  useEffect(() => {
    if (open) {
      setUrlInput('');
      setPreviewSrc(null);
      setCurrentInstant(null);
      setAltText('');
      setAlignment('center');
      setMaxWidthPercent('100');
      setActiveTab('upload');
    }
  }, [open]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      alert('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    // Instant Preview Generation in < 2ms (Never blocks main UI thread)
    const instant = ImageAssetEngine.createInstantAsset(file);
    setCurrentInstant(instant);
    setPreviewSrc(instant.previewUrl);
    setAltText(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    const instant = ImageAssetEngine.createInstantAsset(urlInput.trim(), 'Web Image');
    setCurrentInstant(instant);
    setPreviewSrc(instant.previewUrl);
  };

  const handleConfirmInsert = () => {
    if (!previewSrc) return;

    onInsertImage({
      src: previewSrc,
      imageId: currentInstant?.assetId,
      alt: altText || currentInstant?.name || 'Image',
      title: altText,
      align: alignment,
      width: `${maxWidthPercent}%`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[540px] p-5 text-xs max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isReplacing ? 'Replace Image' : 'Add Image to Document'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Instant image upload from your device, camera photo, or web URL.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Device</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'camera' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Take Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'url' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab Content & Upload Zone */}
        {!previewSrc ? (
          <div className="my-3">
            {activeTab === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2.5">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-semibold text-sm text-foreground">Click or Drag &amp; Drop Image Here</p>
                <p className="text-[11px] text-muted-foreground mt-1">Instant preview for PNG, JPG, WebP, GIF, and SVG</p>
              </div>
            )}

            {activeTab === 'camera' && (
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              >
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2.5">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="font-semibold text-sm text-foreground">Tap to Capture Photo</p>
                <p className="text-[11px] text-muted-foreground mt-1">Uses mobile device camera capture</p>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Image Web Address (URL)</label>
                  <Input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="h-8 text-xs font-mono"
                    onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                  />
                </div>
                <Button size="sm" onClick={handleUrlSubmit} disabled={!urlInput.trim()} className="w-full text-xs gap-1">
                  <Eye className="h-3.5 w-3.5" /> Preview Image
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Preview & Customization View */
          <div className="my-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-primary" /> Image Preview
              </span>
              <button
                type="button"
                onClick={() => { setPreviewSrc(null); setCurrentInstant(null); }}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Choose Different File
              </button>
            </div>

            {/* Preview Box */}
            <div className="rounded-xl border border-border bg-muted/40 p-3 flex flex-col items-center justify-center overflow-hidden">
              <img
                src={previewSrc}
                alt={altText || 'Preview'}
                style={{
                  maxHeight: '190px',
                  borderRadius: '8px',
                  width: `${maxWidthPercent}%`,
                }}
                className="object-contain shadow-sm"
              />

              {currentInstant && (
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 font-mono">
                  <span className="truncate max-w-[160px] font-semibold text-foreground">{currentInstant.name}</span>
                  <span>•</span>
                  <span>{Math.round(currentInstant.size / 1024)} KB</span>
                </div>
              )}
            </div>

            {/* Formatting Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Alt Text / Caption</label>
                <Input
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  placeholder="Describe image for accessibility"
                  className="h-7 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Alignment</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['left', 'center', 'right'] as const).map(a => (
                    <Button
                      key={a}
                      type="button"
                      variant={alignment === a ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-[11px] capitalize"
                      onClick={() => setAlignment(a)}
                    >
                      {a}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t border-border mt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleConfirmInsert}
            disabled={!previewSrc}
            className="gap-1.5 bg-primary font-semibold text-primary-foreground shadow-xs"
          >
            <Check className="h-3.5 w-3.5" />
            {isReplacing ? 'Replace Image' : 'Insert Image'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
