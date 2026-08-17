import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StudioDocument } from '@/engines/types';
import { ExportEngine } from '@/engines/ExportEngine';
import { useToastStore } from '@/store/toastStore';
import {
  FileCode, FileText, FileType, FileDown, FileSpreadsheet,
  Download, Layers, Sparkles, FileArchive, Presentation,
  Table, Grid, FileCheck
} from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  document: StudioDocument;
}

export function ExportModal({ open, onClose, document }: ExportModalProps) {
  const toast = useToastStore();

  const formats = [
    {
      id: 'docx',
      label: 'Microsoft Word (DOCX)',
      desc: 'Standard Word document with styles, tables & formatting',
      icon: FileText,
      color: '#2563EB',
      action: () => {
        ExportEngine.exportDocx(document);
        toast.success('Downloaded as DOCX');
      },
    },
    {
      id: 'pdf',
      label: 'PDF Document',
      desc: 'Print-ready formatted PDF with high fidelity',
      icon: FileDown,
      color: '#EF4444',
      action: () => {
        ExportEngine.printDocument(document);
        toast.success('Opening print / PDF preview');
      },
    },
    {
      id: 'xlsx',
      label: 'Microsoft Excel (XLSX)',
      desc: 'Spreadsheet workbook with formatted tables & columns',
      icon: FileSpreadsheet,
      color: '#10B981',
      action: () => {
        ExportEngine.exportExcel(document);
        toast.success('Downloaded as Excel (.xlsx)');
      },
    },
    {
      id: 'csv',
      label: 'CSV Data Sheet (CSV)',
      desc: 'Comma-separated values for analytics and databases',
      icon: Table,
      color: '#0D9488',
      action: () => {
        ExportEngine.exportCsv(document);
        toast.success('Downloaded as CSV');
      },
    },
    {
      id: 'pptx',
      label: 'PowerPoint / Slides (PPTX)',
      desc: 'Widescreen presentation deck with slide layouts',
      icon: Presentation,
      color: '#EA580C',
      action: () => {
        ExportEngine.exportPptx(document);
        toast.success('Downloaded Presentation deck');
      },
    },
    {
      id: 'md',
      label: 'Markdown (MD)',
      desc: 'Clean markdown syntax for GitHub and documentation',
      icon: FileType,
      color: '#8B5CF6',
      action: () => {
        ExportEngine.exportMarkdown(document);
        toast.success('Downloaded as Markdown');
      },
    },
    {
      id: 'html',
      label: 'Web Page (HTML)',
      desc: 'Standalone responsive HTML file with CSS styles',
      icon: FileCode,
      color: '#F59E0B',
      action: () => {
        ExportEngine.exportHtml(document);
        toast.success('Downloaded as HTML');
      },
    },
    {
      id: 'opendoc',
      label: 'OpenDoc Project Bundle',
      desc: 'Complete project bundle preserving slides, canvas & metadata',
      icon: FileArchive,
      color: '#6366F1',
      action: () => {
        ExportEngine.exportOpenDocProject(document);
        toast.success('Downloaded OpenDoc project file');
      },
    },
    {
      id: 'txt',
      label: 'Plain Text (TXT)',
      desc: 'Clean plain text extraction without formatting',
      icon: FileText,
      color: '#64748B',
      action: () => {
        ExportEngine.exportPlainText(document);
        toast.success('Downloaded as TXT');
      },
    },
    {
      id: 'rtf',
      label: 'Rich Text Format (RTF)',
      desc: 'Cross-platform standard rich text file',
      icon: FileCheck,
      color: '#0284C7',
      action: () => {
        ExportEngine.exportRtf(document);
        toast.success('Downloaded as RTF');
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export & Download Document
          </DialogTitle>
          <DialogDescription>
            Choose your desired format to download "{document.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {formats.map(fmt => (
            <button
              key={fmt.id}
              onClick={() => {
                fmt.action();
                onClose();
              }}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/50 transition-all text-left group shadow-sm hover:shadow"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: fmt.color + '15', color: fmt.color }}
              >
                <fmt.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {fmt.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  {fmt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
