import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, Upload, Sun, Moon, Monitor, Menu, Command, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSettingsStore } from '@/store/settingsStore'
import { useDocumentsStore } from '@/store/documentsStore'
import { cn, formatRelative } from '@/utils/cn'
import { debounce } from '@/utils/cn'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate()
  const { theme, setTheme, compactSidebar, setCompactSidebar } = useSettingsStore()
  const { createDocument } = useDocumentsStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const handleNewDoc = () => {
    const doc = createDocument()
    navigate(`/editor/${doc.id}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  const themeIcons: Record<string, React.ReactNode> = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  }

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20 flex items-center gap-3 px-4">
      {/* Mobile menu */}
      <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={onMenuClick}>
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar toggle (desktop) */}
      <Button variant="ghost" size="icon" className="hidden lg:flex shrink-0" onClick={() => setCompactSidebar(!compactSidebar)} title="Toggle sidebar">
        {compactSidebar ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search documents… (Ctrl+K)"
            className="pl-9 pr-16 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:bg-background"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setSearchQuery('')
            }}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </form>

      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Toggle theme">
              {themeIcons[theme]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme('light')} className={cn(theme === 'light' && 'bg-accent')}>
              <Sun className="h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className={cn(theme === 'dark' && 'bg-accent')}>
              <Moon className="h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className={cn(theme === 'system' && 'bg-accent')}>
              <Monitor className="h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import */}
        <Button variant="ghost" size="icon" onClick={() => navigate('/import')} title="Import document">
          <Upload className="h-4 w-4" />
        </Button>

        {/* New document */}
        <Button size="sm" className="gap-2" onClick={handleNewDoc}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </div>
    </header>
  )
}
