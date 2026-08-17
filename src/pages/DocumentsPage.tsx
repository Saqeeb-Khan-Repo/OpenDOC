import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Plus, Search, Grid, List, SortAsc, SortDesc, Star, StarOff,
  MoreVertical, Trash2, Copy, FolderOpen, Download, Edit3,
  FileText, Clock, Filter, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useDocumentsStore } from '@/store/documentsStore'
import { useFoldersStore } from '@/store/foldersStore'
import { useToastStore } from '@/store/toastStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Document, SortField, SortOrder, ViewMode } from '@/types'
import { cn, formatDate, formatRelative, getFileTypeColor, getFileTypeLabel, generateExcerpt } from '@/utils/cn'
import { exportAsHtml, exportAsTxt, exportAsMarkdown } from '@/utils/export'

interface DocumentCardProps {
  doc: Document
  viewMode: ViewMode
  onOpen: (id: string) => void
  onStar: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onExport: (id: string, format: 'html' | 'txt' | 'md') => void
  folders: ReturnType<typeof useFoldersStore.getState>['folders']
  onMoveToFolder: (id: string, folderId: string | null) => void
}

function DocumentCard({ doc, viewMode, onOpen, onStar, onDelete, onDuplicate, onExport, folders, onMoveToFolder }: DocumentCardProps) {
  const folder = doc.folderId ? folders.find(f => f.id === doc.folderId) : null

  if (viewMode === 'list') {
    return (
      <div
        className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors rounded-lg cursor-pointer border border-transparent hover:border-border"
        onClick={() => onOpen(doc.id)}
      >
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{doc.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{generateExcerpt(doc.content, 80)}</p>
        </div>
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {folder && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: folder.color }} />
              <span>{folder.name}</span>
            </div>
          )}
          <Badge variant="outline" className={cn('text-xs', getFileTypeColor(doc.fileType))}>
            {getFileTypeLabel(doc.fileType)}
          </Badge>
          <span className="text-xs text-muted-foreground w-28 text-right">{formatRelative(doc.updatedAt)}</span>
          <span className="text-xs text-muted-foreground">{doc.wordCount} words</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" onClick={() => onStar(doc.id)} title={doc.isStarred ? 'Unstar' : 'Star'}>
            {doc.isStarred ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : <Star className="h-3.5 w-3.5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onOpen(doc.id)}><Edit3 className="h-4 w-4" /> Open</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(doc.id)}><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport(doc.id, 'html')}><Download className="h-4 w-4" /> Export HTML</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(doc.id, 'txt')}><Download className="h-4 w-4" /> Export TXT</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(doc.id, 'md')}><Download className="h-4 w-4" /> Export Markdown</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(doc.id)}>
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => onOpen(doc.id)}
    >
      {/* Preview area */}
      <div className="h-36 bg-muted/40 p-4 overflow-hidden relative">
        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-6 pointer-events-none select-none">
          {generateExcerpt(doc.content, 200) || <span className="italic">Empty document</span>}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted/40" />
      </div>
      {/* Card body */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{doc.title}</h3>
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon-sm" onClick={() => onStar(doc.id)}>
              {doc.isStarred ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : <Star className="h-3.5 w-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onOpen(doc.id)}><Edit3 className="h-4 w-4" /> Open</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(doc.id)}><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport(doc.id, 'html')}><Download className="h-4 w-4" /> Export HTML</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport(doc.id, 'txt')}><Download className="h-4 w-4" /> Export TXT</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport(doc.id, 'md')}><Download className="h-4 w-4" /> Export Markdown</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(doc.id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn('text-xs', getFileTypeColor(doc.fileType))}>
            {getFileTypeLabel(doc.fileType)}
          </Badge>
          {folder && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: folder.color }} />
              <span>{folder.name}</span>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{formatRelative(doc.updatedAt)}</p>
      </div>
    </div>
  )
}

export function DocumentsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getActiveDocuments, getRecentDocuments, getStarredDocuments, createDocument, deleteDocument, toggleStar, duplicateDocument } = useDocumentsStore()
  const { folders } = useFoldersStore()
  const toast = useToastStore()
  const { defaultView } = useSettingsStore()

  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView)
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const isRecent = location.pathname === '/documents/recent'
  const isStarred = location.pathname === '/documents/starred'

  const baseDocuments = useMemo(() => {
    if (isRecent) return getRecentDocuments(50)
    if (isStarred) return getStarredDocuments()
    return getActiveDocuments()
  }, [isRecent, isStarred, getActiveDocuments, getRecentDocuments, getStarredDocuments])

  const documents = useMemo(() => {
    let docs = [...baseDocuments]

    if (query.trim()) {
      const q = query.toLowerCase()
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content.replace(/<[^>]+>/g, ' ').toLowerCase().includes(q)
      )
    }

    if (filterType !== 'all') {
      docs = docs.filter(d => d.fileType === filterType)
    }

    docs.sort((a, b) => {
      let aVal: string | number = a[sortField] as string
      let bVal: string | number = b[sortField] as string
      if (sortField === 'updatedAt' || sortField === 'createdAt') {
        aVal = new Date(aVal as string).getTime()
        bVal = new Date(bVal as string).getTime()
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return docs
  }, [baseDocuments, query, sortField, sortOrder, filterType])

  const handleNewDoc = () => {
    const doc = createDocument()
    navigate(`/editor/${doc.id}`)
  }

  const handleDelete = (id: string) => setDeleteTarget(id)

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteDocument(deleteTarget)
    toast.success('Moved to trash')
    setDeleteTarget(null)
  }

  const handleStar = (id: string) => {
    const doc = baseDocuments.find(d => d.id === id)
    toggleStar(id)
    toast.success(doc?.isStarred ? 'Removed from starred' : 'Added to starred')
  }

  const handleDuplicate = (id: string) => {
    const copy = duplicateDocument(id)
    if (copy) toast.success('Document duplicated')
  }

  const handleExport = (id: string, format: 'html' | 'txt' | 'md') => {
    const doc = baseDocuments.find(d => d.id === id)
    if (!doc) return
    switch (format) {
      case 'html': exportAsHtml(doc.title, doc.content); break
      case 'txt': exportAsTxt(doc.title, doc.content); break
      case 'md': exportAsMarkdown(doc.title, doc.content); break
    }
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  const pageTitle = isRecent ? 'Recent' : isStarred ? 'Starred' : 'My Documents'
  const pageIcon = isRecent ? Clock : isStarred ? Star : FileText

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-3.5 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
          <Button className="gap-2" onClick={handleNewDoc}>
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Filter documents…"
              className="pl-9"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Sort
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortField} onValueChange={v => setSortField(v as SortField)}>
                <DropdownMenuRadioItem value="updatedAt">Last modified</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="createdAt">Date created</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="title">Name</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortOrder} onValueChange={v => setSortOrder(v as SortOrder)}>
                <DropdownMenuRadioItem value="desc">Newest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="asc">Oldest first</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setViewMode('list')}
              className={cn('h-9 w-9 flex items-center justify-center rounded-l-lg transition-colors', viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted')}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn('h-9 w-9 flex items-center justify-center rounded-r-lg transition-colors', viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted')}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y px-3.5 sm:px-6 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {query ? 'No matching documents' : isStarred ? 'No starred documents' : 'No documents yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {query ? 'Try a different search term' : isStarred ? 'Star documents to find them quickly' : 'Create your first document to get started.'}
            </p>
            {!query && !isStarred && (
              <Button onClick={handleNewDoc} className="gap-2">
                <Plus className="h-4 w-4" />
                New Document
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map(doc => (
              <DocumentCard key={doc.id} doc={doc} viewMode="grid" onOpen={id => navigate(`/editor/${id}`)} onStar={handleStar} onDelete={handleDelete} onDuplicate={handleDuplicate} onExport={handleExport} folders={folders} onMoveToFolder={() => {}} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* List header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_80px] items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Name</span>
              <span>Folder</span>
              <span>Modified</span>
              <span>Words</span>
              <span />
            </div>
            {documents.map(doc => (
              <DocumentCard key={doc.id} doc={doc} viewMode="list" onOpen={id => navigate(`/editor/${id}`)} onStar={handleStar} onDelete={handleDelete} onDuplicate={handleDuplicate} onExport={handleExport} folders={folders} onMoveToFolder={() => {}} />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>This document will be moved to the Trash. You can restore it anytime.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Move to Trash</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
