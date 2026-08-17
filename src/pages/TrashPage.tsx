import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useDocumentsStore } from '@/store/documentsStore'
import { useToastStore } from '@/store/toastStore'
import { formatDate, getFileTypeColor, getFileTypeLabel, cn } from '@/utils/cn'

export function TrashPage() {
  const { getTrashedDocuments, restoreDocument, permanentlyDeleteDocument } = useDocumentsStore()
  const toast = useToastStore()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [clearAllOpen, setClearAllOpen] = useState(false)

  const trashed = getTrashedDocuments()

  const handleRestore = (id: string, title: string) => {
    restoreDocument(id)
    toast.success(`"${title}" restored`)
  }

  const handleDelete = (id: string) => setDeleteTarget(id)

  const confirmDelete = () => {
    if (!deleteTarget) return
    permanentlyDeleteDocument(deleteTarget)
    toast.success('Document permanently deleted')
    setDeleteTarget(null)
  }

  const handleClearAll = () => {
    trashed.forEach(d => permanentlyDeleteDocument(d.id))
    toast.success('Trash cleared')
    setClearAllOpen(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-muted-foreground" />
              Trash
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {trashed.length} {trashed.length === 1 ? 'document' : 'documents'} in trash
            </p>
          </div>
          {trashed.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setClearAllOpen(true)}>
              Empty Trash
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {trashed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Trash is empty</h3>
            <p className="text-sm text-muted-foreground">Deleted documents will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Items in trash can be restored or permanently deleted. Permanent deletion cannot be undone.</span>
            </div>
            {trashed.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card group">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-muted-foreground line-through truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn('text-xs', getFileTypeColor(doc.fileType))}>
                      {getFileTypeLabel(doc.fileType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Deleted {formatDate(doc.deletedAt!)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleRestore(doc.id, doc.title)} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The document will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Forever</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
            <AlertDialogDescription>All {trashed.length} document{trashed.length !== 1 ? 's' : ''} in the trash will be permanently deleted. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Empty Trash</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
