import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PDFEngine } from '@/engines/PDFEngine';
import { OCREngine } from '@/engines/OCREngine';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import {
  Camera, Upload, Plus, Trash2, ArrowLeft, ArrowRight,
  RotateCw, Wand2, Download, FileText, CheckCircle2,
  Loader2, Scan, Sparkles, Sliders, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ScannedPageItem {
  id: string;
  originalSrc: string;
  processedSrc: string;
  rotation: number;
  filter: 'none' | 'grayscale' | 'contrast' | 'sharpen';
}

export function DocumentScanner() {
  const [pages, setPages] = useState<ScannedPageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stepMessage, setStepMessage] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith('image/') && !file.name.endsWith('.pdf')) {
        toast.error(`"${file.name}" is not a supported image/scan.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const newPage: ScannedPageItem = {
          id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          originalSrc: src,
          processedSrc: src,
          rotation: 0,
          filter: 'none',
        };
        setPages(prev => [...prev, newPage]);
      };
      reader.readAsDataURL(file);
    });

    toast.success('Added scanned page(s).');
  };

  const handleRotatePage = (id: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === id) {
        const nextRotation = (p.rotation + 90) % 360;
        return { ...p, rotation: nextRotation };
      }
      return p;
    }));
  };

  const handleApplyFilter = (id: string, filter: 'none' | 'grayscale' | 'contrast' | 'sharpen') => {
    setPages(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, filter };
      }
      return p;
    }));
  };

  const handleMovePage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const nextPages = [...pages];
    const temp = nextPages[index];
    nextPages[index] = nextPages[targetIndex];
    nextPages[targetIndex] = temp;
    setPages(nextPages);
  };

  const handleDeletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  // Convert page canvas with rotation and filters to clean raster JPEG
  const renderProcessedImage = async (page: ScannedPageItem): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const isRotated = page.rotation === 90 || page.rotation === 270;
        canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
        canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(page.originalSrc);
          return;
        }

        // Apply filters
        if (page.filter === 'grayscale') {
          ctx.filter = 'grayscale(100%) contrast(120%)';
        } else if (page.filter === 'contrast') {
          ctx.filter = 'contrast(150%) brightness(105%)';
        } else if (page.filter === 'sharpen') {
          ctx.filter = 'contrast(130%) brightness(100%)';
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((page.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = page.originalSrc;
    });
  };

  // 1. Scan & Extract with OCR into Document Editor
  const handleScanToDocument = async () => {
    if (pages.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(15);
    setStepMessage('Enhancing multi-page document images...');

    try {
      const combinedHtmlParts: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        setProgressPercent(Math.round(20 + ((i + 1) / pages.length) * 70));
        setStepMessage(`Running optical character recognition on page ${i + 1} of ${pages.length}...`);

        const processedDataUrl = await renderProcessedImage(page);

        // Convert dataUrl to File for OCREngine
        const res = await fetch(processedDataUrl);
        const blob = await res.blob();
        const file = new File([blob], `page_${i + 1}.jpg`, { type: 'image/jpeg' });

        const ocr = await OCREngine.scanDocument(file);
        combinedHtmlParts.push(ocr.htmlContent);
      }

      setIsProcessing(false);

      const finalHtml = combinedHtmlParts.join('\n<div data-type="page-break"></div>\n');
      const doc = createDocument({
        title: `Scanned Document (${pages.length} Pages)`,
        content: finalHtml,
        mode: 'document',
      });

      toast.success(`OCR completed! Created editable document.`);
      navigate(`/editor/${doc.id}`);
    } catch (err: any) {
      console.error('Scan OCR error:', err);
      setIsProcessing(false);
      toast.error('Failed to run OCR on document pages.');
    }
  };

  // 2. Scan to PDF Download
  const handleScanToPDF = async () => {
    if (pages.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(15);
    setStepMessage('Rendering pages to PDF...');

    try {
      const imagesToEmbed: { dataUrl: string }[] = [];
      for (let i = 0; i < pages.length; i++) {
        const processed = await renderProcessedImage(pages[i]);
        imagesToEmbed.push({ dataUrl: processed });
      }

      const pdfBytes = await PDFEngine.createPDFFromImages(
        imagesToEmbed,
        (pct, msg) => {
          setProgressPercent(pct);
          setStepMessage(msg);
        }
      );

      setIsProcessing(false);
      PDFEngine.downloadBuffer(pdfBytes, `scanned-document-${Date.now()}.pdf`);
      toast.success('Downloaded compiled PDF document!');
    } catch (err: any) {
      console.error('Scan to PDF error:', err);
      setIsProcessing(false);
      toast.error('Failed to compile PDF.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" /> Multi-Page Document Scanner
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture, enhance, and compile multiple physical sheets into a searchable PDF or editable document.
          </p>
        </div>

        {/* Capture / Upload Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => {
              handleAddFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp,image/tiff"
            onChange={e => {
              handleAddFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />

          <Button
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            <Camera className="h-4 w-4" /> Take Photo
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => galleryInputRef.current?.click()}
            className="gap-1.5 font-semibold"
          >
            <Upload className="h-4 w-4" /> Upload Images
          </Button>

          {pages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPages([])}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {pages.length === 0 ? (
        <div
          onClick={() => galleryInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            handleAddFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-border hover:border-primary/50 bg-card/60 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
        >
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
            <Camera className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Snap Photos or Upload Scanned Pages</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Capture multiple sheets in sequence. Enhance contrast, rotate, and extract into editable text or PDF.
          </p>
          <div className="flex items-center gap-2 mt-5">
            <Button
              variant="default"
              size="sm"
              onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold text-white"
            >
              <Camera className="h-4 w-4" /> Take Photo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={e => { e.stopPropagation(); galleryInputRef.current?.click(); }}
              className="gap-1.5 font-semibold"
            >
              <Upload className="h-4 w-4" /> Choose from Gallery
            </Button>
          </div>
        </div>
      ) : (
        /* Scanned Pages Queue & Enhancement Area */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-medium">
            <span>SCANNED PAGES ({pages.length})</span>
            <span className="italic text-[11px]">Rotate or apply enhancement filters per page</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                className="p-3 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-3 group"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Page {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={idx === 0}
                      onClick={() => handleMovePage(idx, 'left')}
                      className="h-6 w-6"
                      title="Move Left"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={idx === pages.length - 1}
                      onClick={() => handleMovePage(idx, 'right')}
                      className="h-6 w-6"
                      title="Move Right"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeletePage(page.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      title="Delete Page"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Page Thumbnail with Rotation */}
                <div className="h-44 rounded-xl border border-border/80 bg-muted/30 overflow-hidden flex items-center justify-center p-2 relative">
                  <img
                    src={page.originalSrc}
                    alt={`Page ${idx + 1}`}
                    style={{
                      transform: `rotate(${page.rotation}deg)`,
                      filter: page.filter === 'grayscale' ? 'grayscale(100%) contrast(120%)' : page.filter === 'contrast' ? 'contrast(150%)' : 'none',
                      maxHeight: '100%',
                      maxWidth: '100%',
                    }}
                    className="object-contain transition-all rounded"
                  />
                </div>

                {/* Enhancement Controls */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotatePage(page.id)}
                    className="h-7 text-[11px] gap-1 px-2"
                  >
                    <RotateCw className="h-3 w-3" /> Rotate 90°
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyFilter(page.id, 'grayscale')}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded border transition-colors',
                        page.filter === 'grayscale' ? 'bg-primary text-primary-foreground border-primary font-bold' : 'border-border hover:bg-muted text-muted-foreground'
                      )}
                    >
                      B&amp;W
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFilter(page.id, 'contrast')}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded border transition-colors',
                        page.filter === 'contrast' ? 'bg-primary text-primary-foreground border-primary font-bold' : 'border-border hover:bg-muted text-muted-foreground'
                      )}
                    >
                      Contrast
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {stepMessage}
                </span>
                <span className="font-mono font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Hub */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Ready to process <strong className="text-foreground">{pages.length} scanned page(s)</strong>.
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleScanToPDF}
                disabled={isProcessing || pages.length === 0}
                className="gap-1.5 font-semibold"
              >
                <Download className="h-4 w-4 text-primary" /> Scan to PDF
              </Button>

              <Button
                size="sm"
                onClick={handleScanToDocument}
                disabled={isProcessing || pages.length === 0}
                className="gap-1.5 bg-primary font-semibold text-primary-foreground shadow-xs"
              >
                <Sparkles className="h-4 w-4" /> Scan &amp; Extract (OCR)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
