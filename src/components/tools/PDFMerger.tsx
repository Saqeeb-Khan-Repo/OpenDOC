import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PDFEngine, MergablePDFItem } from '@/engines/PDFEngine';
import {
  FileText, Plus, Trash2, ArrowUp, ArrowDown, Download,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Upload,
  Layers, FileCheck, Move
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastStore();

  const handleAddFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: MergablePDFItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error(`"${file.name}" is not a PDF file.`);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();

        newItems.push({
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          pageCount,
          buffer,
        });
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
        toast.error(`Failed to read "${file.name}". File may be corrupted or password protected.`);
      }
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
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      toast.error('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setProgressPercent(10);
    setStepMessage('Starting PDF merge...');

    try {
      const bytes = await PDFEngine.mergePDFs(
        items.map(it => ({ name: it.name, buffer: it.buffer })),
        (pct, msg) => {
          setProgressPercent(pct);
          setStepMessage(msg);
        }
      );

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
    PDFEngine.downloadBuffer(mergedPdfBytes, mergedOutputName);
    toast.success(`Downloaded ${mergedOutputName}`);
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

      {/* Empty State / Dropzone */}
      {items.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
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
          <Button variant="default" size="sm" className="mt-5 gap-1.5 font-semibold">
            <Plus className="h-4 w-4" /> Select PDF Files
          </Button>
        </div>
      ) : (
        /* Reorderable List of Files */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-medium">
            <span>FILES TO MERGE ({items.length}) • TOTAL {totalPages} PAGES ({PDFEngine.formatBytes(totalSize)})</span>
            <span className="italic text-[11px]">Drag or use arrows to adjust order</span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all shadow-2xs group"
              >
                {/* Order Index */}
                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-xs text-muted-foreground shrink-0">
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

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(item.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Remove from List"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Progress & Action Section */}
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
                {mergedPdfBytes ? (
                  <Button
                    onClick={handleDownload}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    size="sm"
                  >
                    <Download className="h-4 w-4" /> Download Merged PDF
                  </Button>
                ) : (
                  <Button
                    onClick={handleMerge}
                    disabled={isMerging || items.length < 2}
                    className="gap-2 bg-primary font-semibold shadow-xs"
                    size="sm"
                  >
                    <Layers className="h-4 w-4" /> Merge {items.length} PDFs
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
