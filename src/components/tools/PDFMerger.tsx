import React, { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFEngine, MergablePDFItem } from '@/engines/PDFEngine';
import {
  FileText, Plus, Trash2, ArrowUp, ArrowDown, Download,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Upload,
  Layers, FileCheck, Move, Edit3, Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToastStore } from '@/store/toastStore';
import { PDFDocument } from 'pdf-lib';

export function PDFMerger() {
  const [items, setItems] = useState<MergablePDFItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stepMessage, setStepMessage] = useState('');
  const [mergedPdfBytes, setMergedPdfBytes] = useState<Uint8Array | null>(null);
  const [mergedOutputName, setMergedOutputName] = useState('merged-document.pdf');
  const [isEditingOutputName, setIsEditingOutputName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastStore();

  // Helper to sanitize filename and guarantee single .pdf extension
  const sanitizePdfFilename = (name: string): string => {
    let clean = name.trim().replace(/[/\\:*?"<>|]/g, '_');
    if (!clean) clean = 'merged-document';
    clean = clean.replace(/\.pdf$/i, '');
    return `${clean}.pdf`;
  };

  const handleAddFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: MergablePDFItem[] = [];
    const existingFingerprints = new Set(
      items.map(it => `${it.name}__${it.size}`)
    );
    let duplicateCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error(`"${file.name}" is not a PDF file.`);
        continue;
      }

      const fingerprint = `${file.name}__${file.size}`;
      if (existingFingerprints.has(fingerprint)) {
        duplicateCount++;
        continue;
      }
      existingFingerprints.add(fingerprint);

      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();

        newItems.push({
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
          name: file.name,
          size: file.size,
          pageCount,
          buffer,
        });
      } catch (err: any) {
        console.error(`Error reading ${file.name}:`, err);
        if (err?.message?.toLowerCase().includes('encrypt') || err?.message?.toLowerCase().includes('password')) {
          toast.error(`"${file.name}" is password protected. Please unlock it before merging.`);
        } else {
          toast.error(`Failed to read "${file.name}". File may be corrupted or invalid.`);
        }
      }
    }

    if (duplicateCount > 0) {
      toast.error(`Ignored ${duplicateCount} duplicate PDF file(s).`);
    }

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
      setMergedPdfBytes(null);
      toast.success(`Added ${newItems.length} PDF file(s).`);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    setItems(nextItems);
    setMergedPdfBytes(null);
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setMergedPdfBytes(null);
  };

  const handleClearAll = () => {
    setItems([]);
    setMergedPdfBytes(null);
    setMergedOutputName('merged-document.pdf');
  };

  const handleMerge = async () => {
    if (isMerging) return;
    if (items.length < 2) {
      toast.error('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setProgressPercent(10);
    setStepMessage('Reading and preparing PDF pages...');

    try {
      const bytes = await PDFEngine.mergePDFs(
        items.map(it => ({ name: it.name, buffer: it.buffer })),
        (pct, msg) => {
          setProgressPercent(pct);
          setStepMessage(msg);
        }
      );

      // Default name based on first file name
      const baseName = items[0].name.replace(/\.pdf$/i, '');
      setMergedOutputName(`${baseName}_merged.pdf`);
      setMergedPdfBytes(bytes);
      setIsMerging(false);
      toast.success('PDFs merged successfully!');
    } catch (err: any) {
      console.error('Merge error:', err);
      setIsMerging(false);
      toast.error(err?.message || 'Failed to merge PDF files.');
    }
  };

  const handleDownload = () => {
    if (!mergedPdfBytes) return;
    const finalFilename = sanitizePdfFilename(mergedOutputName);
    PDFEngine.downloadBuffer(mergedPdfBytes, finalFilename);
    toast.success(`Downloaded ${finalFilename}`);
  };

  const totalPages = items.reduce((acc, it) => acc + it.pageCount, 0);
  const totalSize = items.reduce((acc, it) => acc + it.size, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> PDF Merger
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Combine multiple PDF documents into a single organized file completely in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={e => {
              handleAddFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 bg-primary text-primary-foreground font-semibold shadow-xs"
            size="sm"
          >
            <Plus className="h-4 w-4" /> Add PDF Files
          </Button>

          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll} className="text-xs text-muted-foreground hover:text-destructive">
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* ── Result State Banner when Merge is Complete ───────────────────────── */}
      {mergedPdfBytes && (
        <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">PDFs Merged Successfully!</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Merged <strong>{items.length} files</strong> into <strong>{totalPages} pages</strong> ({PDFEngine.formatBytes(mergedPdfBytes.byteLength)})
                </p>
              </div>
            </div>
          </div>

          {/* Editable Filename Section */}
          <div className="p-3.5 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Merged PDF File Name
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={mergedOutputName}
                  onChange={e => setMergedOutputName(e.target.value)}
                  onBlur={() => setMergedOutputName(sanitizePdfFilename(mergedOutputName))}
                  placeholder="merged-document.pdf"
                  className="h-8 text-xs font-mono font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 sm:pt-4 shrink-0">
              <Button
                onClick={handleDownload}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                size="sm"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Merge More PDFs
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Start New
            </button>
          </div>
        </div>
      )}

      {/* Empty State / Dropzone */}
      {items.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={e => {
            e.preventDefault();
            e.stopPropagation();
            handleAddFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-border hover:border-primary/50 bg-card/60 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Select or Drop PDF Files Here</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Add multiple PDFs to arrange, reorder, and combine into a single seamless document.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-5 gap-1.5 font-semibold"
          >
            <Plus className="h-4 w-4" /> Select PDF Files
          </Button>
        </div>
      ) : (
        /* Reorderable List of Files */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-medium">
            <span>FILES TO MERGE ({items.length}) • TOTAL {totalPages} PAGES ({PDFEngine.formatBytes(totalSize)})</span>
            <span className="italic text-[11px] hidden sm:inline">Use arrows to adjust merge sequence</span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all shadow-2xs group"
              >
                {/* Order Index */}
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-xs text-muted-foreground shrink-0">
                  {idx + 1}
                </div>

                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="h-5 w-5" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-foreground truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {item.pageCount} page{item.pageCount !== 1 ? 's' : ''} • {PDFEngine.formatBytes(item.size)}
                  </p>
                </div>

                {/* Controls with touch-friendly min targets */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Remove from List"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Progress & Action Section */}
          {!mergedPdfBytes && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              {isMerging && (
                <div className="space-y-2">
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs text-muted-foreground">
                  Final output will contain <strong className="text-foreground">{totalPages} pages</strong> in the exact sequence shown above.
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleMerge}
                    disabled={isMerging || items.length < 2}
                    className="gap-2 bg-primary font-semibold shadow-xs w-full sm:w-auto"
                    size="sm"
                  >
                    <Layers className="h-4 w-4" /> Merge {items.length} PDFs
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
