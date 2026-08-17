import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFEngine, PDFAnalysisResult } from '@/engines/PDFEngine';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import {
  FileSearch, Upload, CheckCircle2, AlertTriangle, ShieldCheck,
  FileText, Download, Copy, Sparkles, Scan, ArrowRight,
  Layers, Info, Check, RefreshCw, Eye
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function PDFAnalyzer() {
  const [analysis, setAnalysis] = useState<PDFAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();

  const handleAnalyzeFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a PDF document.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await PDFEngine.inspectPDF(file);
      setAnalysis(result);
      setIsAnalyzing(false);
      toast.success(`Analysis complete for "${file.name}"`);
    } catch (err: any) {
      console.error('PDF inspection failure:', err);
      setIsAnalyzing(false);
      toast.error('Failed to parse PDF document structure.');
    }
  };

  const handleOpenInEditor = () => {
    if (!analysis) return;
    const initialHtml = `<h1>${analysis.title || analysis.fileName.replace('.pdf', '')}</h1>\n<p><strong>Extracted from:</strong> ${analysis.fileName} (${analysis.pageCount} pages)</p>\n<hr/>\n<p>${(analysis.rawTextPreview || '').replace(/\n/g, '<br/>')}</p>`;

    const doc = createDocument({
      title: analysis.title || analysis.fileName.replace('.pdf', ''),
      content: initialHtml,
      mode: 'document',
    });

    toast.success('Document created with extracted text.');
    navigate(`/editor/${doc.id}`);
  };

  const handleCopyText = () => {
    if (!analysis?.rawTextPreview) return;
    navigator.clipboard.writeText(analysis.rawTextPreview);
    toast.success('Extracted text copied to clipboard.');
  };

  const handleDownloadTxt = () => {
    if (!analysis?.rawTextPreview) return;
    const blob = new Blob([analysis.rawTextPreview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.fileName.replace('.pdf', '')}-extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded text file.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" /> PDF Analyzer &amp; Quality Inspector
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspect layout structure, extract embedded text, and run accessibility quality audits completely client-side.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={e => {
              if (e.target.files?.[0]) handleAnalyzeFile(e.target.files[0]);
              e.target.value = '';
            }}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 bg-primary font-semibold shadow-xs"
            size="sm"
          >
            <Upload className="h-4 w-4" /> {analysis ? 'Analyze Another PDF' : 'Upload PDF'}
          </Button>
        </div>
      </div>

      {/* Upload Dropzone if no analysis yet */}
      {!analysis ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleAnalyzeFile(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-border hover:border-primary/50 bg-card/60 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <FileSearch className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Select or Drop a PDF Document</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Analyzes pages, fonts, images, tables, metadata, and structural density.
          </p>
          <Button variant="default" size="sm" className="mt-5 gap-1.5 font-semibold">
            <Upload className="h-4 w-4" /> Choose PDF File
          </Button>
        </div>
      ) : (
        /* Analysis Results Dashboard */
        <div className="space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">File Name</span>
              <p className="font-bold text-xs sm:text-sm text-foreground truncate mt-1" title={analysis.fileName}>
                {analysis.fileName}
              </p>
              <span className="text-[10px] text-muted-foreground font-mono">{analysis.fileSizeFormatted}</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Page Count</span>
              <p className="font-bold text-lg text-foreground mt-0.5">{analysis.pageCount}</p>
              <span className="text-[10px] text-muted-foreground capitalize">{analysis.orientation} Layout</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Dimensions</span>
              <p className="font-bold text-xs sm:text-sm text-foreground mt-1 font-mono">{analysis.pageDimensions}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Standard Ratio</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Quality Score</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-extrabold text-primary">{analysis.qualityScore}/100</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                  Good
                </span>
              </div>
            </div>
          </div>

          {/* Detected Feature Badges */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <span className="text-xs font-semibold text-foreground block">Detected Document Features</span>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Text Detected
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-medium">
                {analysis.detectedFeatures.imageCount} Embedded Images
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-medium">
                {analysis.detectedFeatures.tableCountEstimated} Tables Detected
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-medium">
                {analysis.detectedFeatures.linksCountEstimated} Links
              </span>
              {analysis.title && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                  Title: {analysis.title}
                </span>
              )}
            </div>
          </div>

          {/* Page-by-Page Overview */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Page-by-Page Structure ({analysis.pages.length} Pages)</span>
              <span className="text-[11px] text-muted-foreground">Showing optical density &amp; flags</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {analysis.pages.map(p => (
                <div
                  key={p.pageIndex}
                  className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex flex-col justify-between text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="font-semibold text-foreground">Page {p.pageIndex + 1}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{p.width} × {p.height} pt</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                    <span className="text-emerald-600 font-medium">✓ Text</span>
                    <span>•</span>
                    <span>{p.hasImages ? '✓ Images' : 'No images'}</span>
                    <span>•</span>
                    <span className={cn(p.estimatedTextDensity === 'high' ? 'text-amber-600 font-semibold' : '')}>
                      {p.estimatedTextDensity} density
                    </span>
                  </div>

                  {p.warnings.length > 0 && (
                    <div className="text-[10px] text-amber-600 flex items-center gap-1 pt-0.5">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span className="truncate">{p.warnings[0]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Text Extraction & Actions Box */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Extracted Document Text
                </h3>
                <p className="text-xs text-muted-foreground">
                  Open directly into the document editor or copy text locally.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleCopyText} className="h-8 text-xs gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Copy Text
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="h-8 text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download .TXT
                </Button>
                <Button size="sm" onClick={handleOpenInEditor} className="h-8 text-xs gap-1.5 bg-primary font-semibold">
                  <ArrowRight className="h-3.5 w-3.5" /> Open in Editor
                </Button>
              </div>
            </div>

            {/* Collapsible Text Preview */}
            <div className="rounded-xl border border-border bg-muted/40 p-3 max-h-48 overflow-y-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {analysis.rawTextPreview}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
