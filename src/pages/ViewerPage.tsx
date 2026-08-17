import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FileText, Download, ArrowLeft, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { decodeSharePayload, copyToClipboard } from '@/utils/share'
import { exportAsHtml, exportAsTxt, exportAsMarkdown, exportAsPrintPdf } from '@/utils/export'
import { useDocumentsStore } from '@/store/documentsStore'
import { useToastStore } from '@/store/toastStore'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function ViewerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { createDocument } = useDocumentsStore()
  const toast = useToastStore()
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const encoded = searchParams.get('d')
  const data = encoded ? decodeSharePayload(encoded) : null

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(window.location.href)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 3000) }
  }

  const handleSaveCopy = () => {
    if (!data) return
    createDocument({ title: `${data.title} (copy)`, content: data.content })
    setSaved(true)
    toast.success('Saved a copy to your workspace!')
    setTimeout(() => navigate('/documents'), 1500)
  }

  // ── Invalid / missing link ────────────────────────────────────
  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-2">Invalid or Expired Link</h1>
          <p className="text-muted-foreground text-sm mb-6">
            This share link is invalid or the document data could not be decoded. Please ask the sender for a new link.
          </p>
          <Button onClick={() => navigate('/')}>Go to DocProEditor</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Viewer header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo + back */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0 group">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground hidden sm:inline">DocProEditor</span>
          </button>

          <div className="h-5 w-px bg-border mx-1" />

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{data.title}</p>
            <p className="text-xs text-muted-foreground">Shared document — read only</p>
          </div>

          {/* Read-only badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Read Only
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Copy link */}
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopyLink}>
              {copied ? <><Check className="h-3.5 w-3.5 text-emerald-500" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy Link</>}
            </Button>

            {/* Download */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Export as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportAsHtml(data.title, data.content)}>HTML (.html)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsTxt(data.title, data.content)}>Plain Text (.txt)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsMarkdown(data.title, data.content)}>Markdown (.md)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsPrintPdf(data.title, data.content)}>PDF (print)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Save copy */}
            <Button size="sm" className="gap-1.5" onClick={handleSaveCopy} disabled={saved}>
              {saved ? <><Check className="h-3.5 w-3.5" />Saved!</> : <><FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">Save Copy</span></>}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Document content ──────────────────────────────────────── */}
      <div className="flex-1 bg-[hsl(var(--muted)/0.3)]">
        <div className="max-w-4xl mx-auto my-8 px-4">
          <div className="bg-background shadow-sm rounded-xl border border-border/50 overflow-hidden">
            <TiptapEditor
              content={data.content}
              onChange={() => {}}
              editable={false}
            />
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-4 px-4 text-center text-xs text-muted-foreground">
        Powered by{' '}
        <button onClick={() => navigate('/')} className="text-primary hover:underline font-medium">DocProEditor</button>
        {' '}· Your all-in-one document workspace
      </footer>
    </div>
  )
}
