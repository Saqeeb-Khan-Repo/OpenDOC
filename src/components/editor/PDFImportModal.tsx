import React, { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileText, Upload, Sparkles, Check, AlertCircle, Loader2, ArrowRight,
  Layout, Edit3, Layers, FileCheck, RefreshCw, X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { PDFImportEngine, PDFImportConversionResult } from '@/engines/PDFImportEngine';
import { EditablePDFDocument, PageSettings } from '@/engines/types';

interface PDFImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportAsEditablePdf?: (doc: EditablePDFDocument, settings: PageSettings, title: string) => void;
  onImportAsDocflow?: (htmlContent: string, settings: PageSettings, title: string) => void;
}

export function PDFImportModal({
  open,
  onClose,
  onImportAsEditablePdf,
  onImportAsDocflow,
}: PDFImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<PDFImportConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<'edit-pdf' | 'convert-doc'>('edit-pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setIsParsing(false);
    setParseResult(null);
    setError(null);
    setSelectedWorkflow('edit-pdf');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF document (.pdf).');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setError(null);

    try {
      const result = await PDFImportEngine.parsePdf(selectedFile);
      setParseResult(result);
    } catch (err: any) {
      console.error('Failed to parse PDF:', err);
      setError(err?.message || 'Failed to read and parse this PDF. Please check that the file is not password-protected.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleConfirmImport = () => {
    if (!parseResult) return;

    if (selectedWorkflow === 'edit-pdf') {
      if (onImportAsEditablePdf) {
        onImportAsEditablePdf(parseResult.editablePdf, parseResult.pageSettings, parseResult.title);
      }
    } else {
      if (onImportAsDocflow) {
        onImportAsDocflow(parseResult.htmlContent, parseResult.pageSettings, parseResult.title);
      }
    }
    onClose();
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { onClose(); resetState(); } }}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-0 overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-850 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Import PDF Document
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bring any existing PDF into DocProEditor with zero layout drift or convert to editable text.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* File selector dropzone */}
          {!parseResult && !isParsing && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
                "border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20",
                "group flex flex-col items-center justify-center gap-3"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Click to browse or drag & drop PDF file here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports multi-page PDFs, forms, contracts, resumes, and reports
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> High-fidelity text extraction
              </span>
            </div>
          )}

          {/* Loading state */}
          {isParsing && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Analyzing and extracting PDF structure...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Normalizing coordinates, reading font sizes, and resolving page flows.
                </p>
              </div>
            </div>
          )}

          {/* Error notification */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">Unable to import PDF</p>
                <p className="text-rose-700 dark:text-rose-400">{error}</p>
              </div>
            </div>
          )}

          {/* Parsed Result & Mode Selection */}
          {parseResult && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Document Summary Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {parseResult.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {parseResult.editablePdf.pages.length} page(s) detected • {file?.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="h-7 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Change file
                </Button>
              </div>

              {/* Mode Selection Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select How You Want to Work with this PDF
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Mode 1: Edit PDF */}
                  <div
                    onClick={() => setSelectedWorkflow('edit-pdf')}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between",
                      selectedWorkflow === 'edit-pdf'
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Layout className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          Recommended
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Edit PDF (Direct Overlay)
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Keeps exact positions, fonts, and geometry intact. Click to edit any text block in-place, drag blocks, or add new text (<span className="font-semibold">+ Text</span>) anywhere.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {selectedWorkflow === 'edit-pdf' ? (
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Selected</span>
                      ) : (
                        <span>Choose Edit PDF</span>
                      )}
                    </div>
                  </div>

                  {/* Mode 2: Convert to Flowing Document */}
                  <div
                    onClick={() => setSelectedWorkflow('convert-doc')}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between",
                      selectedWorkflow === 'convert-doc'
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Flowable
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Convert to Document
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Extracts text into standard rich-text headings, paragraphs, and lists with preserved page breaks. Full word-processor style typing and styling.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                      {selectedWorkflow === 'convert-doc' ? (
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Selected</span>
                      ) : (
                        <span>Choose Document Flow</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Snippet Preview */}
              {parseResult.rawTextPreview && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Extracted Text Preview:</span>
                    <span>{parseResult.editablePdf.pages.reduce((acc, p) => acc + p.textBlocks.length, 0)} text blocks</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-h-24 overflow-y-auto whitespace-pre-wrap select-all">
                    {parseResult.rawTextPreview}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => { onClose(); resetState(); }}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {parseResult && (
              <Button
                type="button"
                onClick={handleConfirmImport}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 shadow-sm font-semibold flex items-center gap-2"
              >
                {selectedWorkflow === 'edit-pdf' ? (
                  <>
                    <Layout className="w-3.5 h-3.5" />
                    Open in PDF Editor
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    Open as Flowable Document
                  </>
                )}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
