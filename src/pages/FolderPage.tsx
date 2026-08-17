import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, Home, Folder as FolderIcon, MoreVertical, Trash2, Edit3, FileText, FolderPlus, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useFoldersStore } from '@/store/foldersStore'
import { useDocumentsStore } from '@/store/documentsStore'
import { useToastStore } from '@/store/toastStore'
import { cn, formatRelative, generateExcerpt } from '@/utils/cn'

const FOLDER_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16']

export function FolderPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { folders, getFolder, getFolderPath, getChildFolders, createFolder, updateFolder, deleteFolder } = useFoldersStore()
  const { getDocumentsByFolder, createDocument } = useDocumentsStore()
  const toast = useToastStore()

  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0])
  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const isNewFolderPage = id === 'new'
  const currentFolder = id && !isNewFolderPage ? getFolder(id) : null
  const folderPath = currentFolder ? getFolderPath(currentFolder.id) : []
  const subfolders = currentFolder ? getChildFolders(currentFolder.id) : []
  const docs = currentFolder ? getDocumentsByFolder(currentFolder.id) : []

  // Handle "new folder" route
  React.useEffect(() => {
    if (isNewFolderPage) setNewFolderOpen(true)
  }, [isNewFolderPage])

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const folder = createFolder(newFolderName.trim(), id && !isNewFolderPage ? id : null, selectedColor)
    toast.success(`Folder "${folder.name}" created`)
    setNewFolderName('')
    setNewFolderOpen(false)
    if (isNewFolderPage) navigate(`/folders/${folder.id}`)
    else navigate(`/folders/${folder.id}`)
  }

  const handleRename = () => {
    if (!renameTarget || !renameValue.trim()) return
    updateFolder(renameTarget, { name: renameValue.trim() })
    toast.success('Folder renamed')
    setRenameTarget(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteFolder(deleteTarget)
    toast.success('Folder deleted')
    setDeleteTarget(null)
    navigate('/documents')
  }

  const handleNewDoc = () => {
    const doc = createDocument({ folderId: currentFolder?.id ?? null })
    navigate(`/editor/${doc.id}`)
  }

  if (isNewFolderPage) {
    return (
      <Dialog open={newFolderOpen} onOpenChange={open => { if (!open) navigate(-1) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Folder name</label>
              <Input placeholder="e.g. Projects, College, Work…" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={cn('h-7 w-7 rounded-full transition-transform', selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110')} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (!currentFolder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FolderIcon className="h-12 w-12 mb-4 opacity-20" />
        <p className="font-medium">Folder not found</p>
        <Button variant="link" onClick={() => navigate('/documents')}>Go to Documents</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <button onClick={() => navigate('/documents')} className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Home
          </button>
          {folderPath.map((f, i) => (
            <React.Fragment key={f.id}>
              <ChevronRight className="h-3.5 w-3.5" />
              <button onClick={() => navigate(`/folders/${f.id}`)} className={cn('hover:text-foreground transition-colors', i === folderPath.length - 1 && 'text-foreground font-medium')}>{f.name}</button>
            </React.Fragment>
          ))}
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: currentFolder.color + '20' }}>
              <FolderIcon className="h-5 w-5" style={{ color: currentFolder.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{currentFolder.name}</h1>
              <p className="text-sm text-muted-foreground">{docs.length} document{docs.length !== 1 ? 's' : ''} · {subfolders.length} subfolder{subfolders.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setNewFolderOpen(true)}>
              <FolderPlus className="h-4 w-4" /> New Folder
            </Button>
            <Button size="sm" className="gap-2" onClick={handleNewDoc}>
              <Plus className="h-4 w-4" /> New Document
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y px-3.5 sm:px-6 py-4 space-y-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Subfolders */}
        {subfolders.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Subfolders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {subfolders.map(folder => (
                <div key={folder.id} className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer" onClick={() => navigate(`/folders/${folder.id}`)}>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: folder.color + '20' }}>
                    <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
                  </div>
                  <span className="font-medium text-sm truncate flex-1">{folder.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setRenameTarget(folder.id); setRenameValue(folder.name) }}><Edit3 className="h-4 w-4" /> Rename</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(folder.id)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {docs.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Documents</h2>
            <div className="flex flex-col gap-1">
              {docs.map(doc => (
                <div key={doc.id} className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer" onClick={() => navigate(`/editor/${doc.id}`)}>
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{generateExcerpt(doc.content, 70)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelative(doc.updatedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {subfolders.length === 0 && docs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FolderIcon className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="font-semibold text-lg mb-1">This folder is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">Add documents or create subfolders to organise your work.</p>
            <Button onClick={handleNewDoc} className="gap-2"><Plus className="h-4 w-4" />New Document</Button>
          </div>
        )}
      </div>

      {/* New subfolder dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Subfolder</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Folder name…" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} autoFocus />
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map(color => (
                <button key={color} onClick={() => setSelectedColor(color)} className={cn('h-7 w-7 rounded-full transition-transform', selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110')} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={open => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
          <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename()} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete folder dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>This will delete the folder and all its subfolders. Documents inside will not be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
