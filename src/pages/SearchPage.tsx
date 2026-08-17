import React, { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, FileText, Folder as FolderIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDocumentsStore } from '@/store/documentsStore'
import { useFoldersStore } from '@/store/foldersStore'
import { cn, formatRelative, getFileTypeColor, getFileTypeLabel, generateExcerpt } from '@/utils/cn'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { searchDocuments } = useDocumentsStore()
  const { searchFolders } = useFoldersStore()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const docResults = useMemo(() => (query.trim() ? searchDocuments(query) : []), [query, searchDocuments])
  const folderResults = useMemo(() => (query.trim() ? searchFolders(query) : []), [query, searchFolders])
  const total = docResults.length + folderResults.length

  const handleSearch = (q: string) => {
    setQuery(q)
    setSearchParams(q ? { q } : {})
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Search</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search documents, folders…"
            className="pl-12 h-12 text-base"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
        </div>
        {query.trim() && (
          <p className="text-sm text-muted-foreground mt-2">
            {total} result{total !== 1 ? 's' : ''} for "{query}"
          </p>
        )}
      </div>

      {!query.trim() && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium">Start typing to search</p>
          <p className="text-sm mt-1">Search through document titles and content</p>
        </div>
      )}

      {query.trim() && total === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">Try different keywords</p>
        </div>
      )}

      {docResults.length > 0 && (
        <div className="space-y-2 mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Documents</h2>
          {docResults.map(doc => (
            <button
              key={doc.id}
              onClick={() => navigate(`/editor/${doc.id}`)}
              className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/20 transition-all text-left"
            >
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{doc.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{generateExcerpt(doc.content, 120)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={cn('text-xs', getFileTypeColor(doc.fileType))}>
                    {getFileTypeLabel(doc.fileType)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatRelative(doc.updatedAt)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {folderResults.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Folders</h2>
          {folderResults.map(folder => (
            <button
              key={folder.id}
              onClick={() => navigate(`/folders/${folder.id}`)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/20 transition-all text-left"
            >
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: folder.color + '20' }}>
                <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
              </div>
              <div>
                <p className="font-medium text-sm">{folder.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Folder</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
