import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Loader2,
  Plus, Scan, Sparkles, ArrowRight, Camera, Image as ImageIcon,
  FileCode, Table, Check, Layers, FileSearch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { ImportEngine, ImportResult } from '@/engines/ImportEngine';
import { OCREngine } from '@/engines/OCREngine';
import { PDFMerger } from '@/components/tools/PDFMerger';
import { PDFAnalyzer } from '@/components/tools/PDFAnalyzer';
import { DocumentScanner } from '@/components/tools/DocumentScanner';
import { cn } from '@/utils/cn';

type ToolTab = 'import' | 'merger' | 'analyzer' | 'scanner';
type ImportStatus = 'idle' | 'reading' | 'done' | 'error';

interface ImportedItem {
  id: string;
  name: string;
  status: ImportStatus;
  stepMessage?: string;
  progressPercent?: number;
  docId?: string;
  error?: string;
  isOcr?: boolean;
}

export function ImportPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ToolTab) || 'import';
  const [activeTab, setActiveTab] = useState<ToolTab>(initialTab);

  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<ImportedItem[]>([]);

  const handleTabChange = (tab: ToolTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const processFile = async (file: File) => {
    const id = Math.random().toString(36).slice(2);
    setFiles(prev => [
      {
        id,
        name: file.name,
        status: 'reading',
        stepMessage: 'Parsing document XML and styles...',
        progressPercent: 20,
        isOcr: false,
      },
      ...prev,
    ]);

    try {
      let result: ImportResult;
      setFiles(prev => prev.map(f => f.id === id ? { ...f, stepMessage: 'Reading document structure & tables...', progressPercent: 60 } : f));
      result = await ImportEngine.parseFile(file);

      // Create interactive studio document
      const doc = createDocument({
        title: result.title || file.name.replace(/\.[^/.]+$/, ''),
        content: result.content || '<p></p>',
        mode: 'document',
        initialData: result.parsedDoc as any,
      });

      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done', docId: doc.id, stepMessage: 'Ready to edit', progressPercent: 100 } : f));
      toast.success(`Successfully imported "${result.title}"`);
    } catch (err: any) {
      console.error('Import failure:', err);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: err?.message || 'Failed to parse file format' } : f));
      toast.error(`Failed to import "${file.name}"`);
    }
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(f => processFile(f));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Tools &amp; Importer</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browser-based PDF Merger, PDF Analyzer, Multi-Page Document Scanner, and File Importer.
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border overflow-x-auto no-scrollbar shrink-0 self-start">
          <button
            type="button"
            onClick={() => handleTabChange('import')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'import' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('merger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'merger' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>PDF Merger</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('analyzer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'analyzer' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileSearch className="h-3.5 w-3.5" />
            <span>PDF Analyzer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('scanner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'scanner' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Scanner &amp; OCR</span>
          </button>
        </div>
      </div>

      {/* ── Tab Views ──────────────────────────────────────────────────────── */}

      {activeTab === 'merger' && <PDFMerger />}
      {activeTab === 'analyzer' && <PDFAnalyzer />}
      {activeTab === 'scanner' && <DocumentScanner />}

      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-2xl p-10 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-200 bg-card/60 backdrop-blur',
              isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/20'
            )}
          >
            <div className={cn('h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-colors', isDragging ? 'bg-primary/20' : 'bg-primary/10')}>
              <Upload className="h-8 w-8 text-primary" />
            </div>

            <h2 className="font-semibold text-base sm:text-lg text-foreground mb-1">
              Drop your files to import
            </h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-md">
              Unpacks formatting, headings, styles, and tables directly into an editable canvas.
            </p>

            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".docx,.txt,.md,.markdown,.html,.htm,.rtf,.csv,.json,.pdf"
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <Button variant="default" className="gap-2 bg-primary font-semibold shadow-md" asChild>
                  <span>
                    <Plus className="h-4 w-4" /> Browse Files
                  </span>
                </Button>
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 font-mono">
              <span>Supported: DOCX, PDF, RTF, Markdown, HTML, TXT, CSV, JSON</span>
            </div>
          </div>

          {/* Imported Documents List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Processed Documents ({files.length})
              </h3>
              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-xs transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-xs text-foreground truncate">{file.name}</p>
                      {file.status === 'reading' && (
                        <span className="font-mono text-[10px] text-primary">{file.progressPercent}%</span>
                      )}
                    </div>

                    {file.status === 'reading' && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-primary animate-pulse">{file.stepMessage || 'Processing...'}</p>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300 rounded-full"
                            style={{ width: `${file.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {file.status === 'done' && (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Ready to edit</span>
                      </div>
                    )}

                    {file.status === 'error' && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{file.error}</span>
                      </div>
                    )}
                  </div>

                  {file.status === 'done' && file.docId && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/editor/${file.docId}`)}
                      className="gap-1 bg-primary text-xs shrink-0"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
