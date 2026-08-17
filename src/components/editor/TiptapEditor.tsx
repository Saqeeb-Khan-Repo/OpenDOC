import React, { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { Extension, Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Typography from '@tiptap/extension-typography'
import Focus from '@tiptap/extension-focus'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks, Quote, Minus, Undo2, Redo2,
  Image as ImageIcon, Table as TableIcon, Highlighter, ChevronDown,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  RemoveFormatting, Code2, Square, RectangleVertical,
  PanelTopOpen, PanelBottomOpen, Frame, SplitSquareVertical,
  Plus, Minus as MinusIcon, Rows, Columns, Trash, Sparkles
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/utils/cn'
import { BorderBox, BorderStyle, BorderType } from './BorderBox'
import { ImageUploadModal } from './ImageUploadModal'
import { ResizableImage } from './ResizableImageExtension'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

// ── Custom Font Size Extension (Canva-Style Per-Character/Per-Selection) ──────
export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
})

// ── Custom Page Break Extension (Ctrl+Enter / Cmd+Enter) ─────────────────────
export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  selectable: true,
  draggable: false,

  parseHTML() {
    return [
      { tag: 'div.page-break-node' },
      { tag: 'div[data-type="page-break"]' },
      { tag: 'hr.page-break' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'page-break-node',
        'data-type': 'page-break',
      }),
      ['span', {}, 'Page Break'],
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.insertContent({ type: this.name }),
    }
  },
})

// ── Toolbar button ────────────────────────────────────────────────────────────
interface TBtnProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

export function TBtn({ onClick, active, disabled, title, children }: TBtnProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'inline-flex items-center justify-center h-7 w-7 rounded-md text-sm transition-all duration-100',
            'hover:bg-accent hover:text-accent-foreground',
            'disabled:pointer-events-none disabled:opacity-40',
            active && 'bg-accent text-accent-foreground font-semibold'
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{title}</TooltipContent>
    </Tooltip>
  )
}

// ── Font Configurations ───────────────────────────────────────────────────────
const FONT_FAMILIES = [
  { name: 'Inter (Sans)', value: 'Inter, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
  { name: 'Merriweather (Serif)', value: 'Merriweather, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Courier New (Mono)', value: '"Courier New", monospace' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
]

const PRESET_FONT_SIZES = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120, 144
]

const TEXT_COLORS = [
  '#000000','#374151','#6B7280','#9CA3AF','#EF4444','#F97316',
  '#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899','#06B6D4',
]
const HIGHLIGHT_COLORS = [
  '#FEF08A','#BBF7D0','#BAE6FD','#FCA5A5','#DDD6FE','#FBCFE8',
  '#FED7AA','#D1FAE5','#CFFAFE','#FCE7F3',
]
const BORDER_COLORS = [
  '#94a3b8','#64748b','#3b82f6','#8b5cf6','#ec4899',
  '#ef4444','#f59e0b','#22c55e','#06b6d4','#000000',
]

// ── Canva-Style Font Size Selector Component ──────────────────────────────────
function FontSizeSelector({ editor }: { editor: Editor }) {
  // Extract currently applied font size or default to 16
  const currentSizeAttr = editor.getAttributes('textStyle').fontSize || ''
  const parsedSize = parseInt(currentSizeAttr.replace('px', ''), 10) || 16
  const [inputValue, setInputValue] = useState(parsedSize.toString())

  useEffect(() => {
    setInputValue(parsedSize.toString())
  }, [parsedSize])

  const applySize = (size: number | string) => {
    const num = typeof size === 'string' ? parseInt(size, 10) : size
    if (!isNaN(num) && num > 0 && num <= 300) {
      editor.chain().focus().setMark('textStyle', { fontSize: `${num}px` }).run()
      setInputValue(num.toString())
    }
  }

  const handleStep = (delta: number) => {
    const next = Math.max(6, Math.min(300, parsedSize + delta))
    applySize(next)
  }

  return (
    <div className="flex items-center bg-muted/50 rounded-md border border-border/80 p-0.5">
      {/* Minus Button */}
      <button
        type="button"
        onClick={() => handleStep(-1)}
        className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Decrease font size (−)"
      >
        <MinusIcon className="h-3 w-3" />
      </button>

      {/* Editable Number Input & Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center cursor-pointer hover:bg-accent/60 rounded px-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applySize(inputValue)
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              onBlur={() => applySize(inputValue)}
              className="w-8 h-6 bg-transparent text-center text-xs font-semibold text-foreground outline-none cursor-text"
              title="Type custom font size"
            />
            <ChevronDown className="h-2.5 w-2.5 opacity-50 ml-0.5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-20 max-h-56 overflow-y-auto text-xs p-1">
          {PRESET_FONT_SIZES.map(s => (
            <DropdownMenuItem
              key={s}
              onClick={() => applySize(s)}
              className={cn(
                'justify-center font-mono py-1',
                parsedSize === s && 'bg-accent font-bold text-primary'
              )}
            >
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Plus Button */}
      <button
        type="button"
        onClick={() => handleStep(1)}
        className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Increase font size (+)"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

// ── Fixed Top Canva-Style Ribbon Toolbar Component ────────────────────────────
export function TiptapToolbar({ editor, onAddPage }: { editor: Editor | null; onAddPage?: () => void }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [borderColor, setBorderColor] = useState('#94a3b8')
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('solid')

  if (!editor) return null

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || 'Inter, sans-serif'
  const isTableActive = editor.isActive('table')

  const applyLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }

  const addImage = () => {
    setImageModalOpen(true)
  }

  const handleInsertImage = (data: { src: string; imageId?: string; alt?: string; title?: string; width?: string; align?: string }) => {
    editor.chain().focus().insertContent({
      type: 'resizableImage',
      attrs: {
        src: data.src,
        imageId: data.imageId,
        alt: data.alt,
        title: data.title,
        width: data.width || '100%',
        align: data.align || 'center',
      },
    }).run()
  }

  const insertTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()

  const insertPageBreak = () => {
    editor.chain().focus().insertContent({ type: 'pageBreak' }).run()
  }

  const applyBorder = (type: BorderType) => {
    editor.chain().focus().toggleBorderBox({ color: borderColor, style: borderStyle, type }).run()
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="bg-background/95 backdrop-blur border-b border-border select-none shrink-0 z-20">
        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
          {/* History */}
          <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
            <Redo2 className="h-3.5 w-3.5" />
          </TBtn>

          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* Font Family */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md bg-muted/40 border border-border/80 text-xs hover:bg-accent transition-colors max-w-[110px] justify-between font-medium truncate"
                title="Font Family"
              >
                <span className="truncate">
                  {FONT_FAMILIES.find(f => f.value === currentFontFamily)?.name.split(' ')[0] || 'Inter'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 text-xs">
              <DropdownMenuLabel>Font Family</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FONT_FAMILIES.map(f => (
                <DropdownMenuItem
                  key={f.value}
                  onClick={() => editor.chain().focus().setFontFamily(f.value).run()}
                  style={{ fontFamily: f.value }}
                  className={cn(currentFontFamily === f.value && 'bg-accent font-bold')}
                >
                  <span>{f.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Font Size Selector */}
          <FontSizeSelector editor={editor} />

          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* Heading Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs hover:bg-accent transition-colors min-w-[80px] justify-between font-medium">
                <span>
                  {[1,2,3,4].find(l => editor.isActive('heading', { level: l }))
                    ? `Heading ${[1,2,3,4].find(l => editor.isActive('heading', { level: l }))}`
                    : 'Normal'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 text-xs">
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} className={cn(editor.isActive('paragraph') && !editor.isActive('heading') && 'bg-accent')}>
                <span>Normal Text</span>
              </DropdownMenuItem>
              {([1,2,3,4] as const).map(level => (
                <DropdownMenuItem key={level} onClick={() => editor.chain().focus().toggleHeading({ level }).run()} className={cn(editor.isActive('heading', { level }) && 'bg-accent font-semibold')}>
                  <span>Heading {level}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Formats: B, I, U */}
          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><Bold className="h-3.5 w-3.5" /></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><Italic className="h-3.5 w-3.5" /></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><UnderlineIcon className="h-3.5 w-3.5" /></TBtn>

          {/* Text Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" title="Text Color" className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors relative">
                <span className="text-xs font-bold leading-none" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }}>A</span>
                <span className="absolute bottom-1 left-1.5 right-1.5 h-0.5 rounded" style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5 w-44 text-xs">
              <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold">Text Color</p>
              <div className="grid grid-cols-6 gap-1">
                {TEXT_COLORS.map(c => (
                  <button key={c} onClick={() => editor.chain().focus().setColor(c).run()} className="h-5 w-5 rounded border border-border/40 hover:scale-110 transition-transform" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
              <button onClick={() => editor.chain().focus().unsetColor().run()} className="mt-2 w-full text-[11px] text-muted-foreground hover:text-foreground text-left">Reset default</button>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* Contextual Table Tools (If inside table) */}
          {isTableActive && (
            <div className="flex items-center gap-0.5 bg-primary/10 px-1 py-0.5 rounded-md border border-primary/30 mr-1">
              <TBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row Below"><Rows className="h-3.5 w-3.5 text-primary" /></TBtn>
              <TBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column Right"><Columns className="h-3.5 w-3.5 text-primary" /></TBtn>
              <TBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row"><Trash className="h-3.5 w-3.5 text-destructive" /></TBtn>
              <TBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table"><Trash className="h-3.5 w-3.5 text-destructive font-bold" /></TBtn>
            </div>
          )}

          {/* Insert Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-semibold hover:bg-accent transition-colors text-primary bg-primary/5 border border-primary/20">
                <Plus className="h-3 w-3" />
                <span>Insert</span>
                <ChevronDown className="h-2.5 w-2.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-xs">
              {onAddPage && (
                <>
                  <DropdownMenuItem onClick={onAddPage} className="font-semibold text-primary"><Plus className="h-3.5 w-3.5 mr-2" /> Add New Page</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={addImage}><ImageIcon className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Image (Upload / Photo)</DropdownMenuItem>
              <DropdownMenuItem onClick={insertTable}><TableIcon className="h-3.5 w-3.5 mr-2 text-blue-500" /> Table (3x3)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLinkInput(true)}><LinkIcon className="h-3.5 w-3.5 mr-2 text-indigo-500" /> Web Link (Ctrl+K)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={insertPageBreak}><SplitSquareVertical className="h-3.5 w-3.5 mr-2 text-primary" /> Page Break (Ctrl+Enter)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-3.5 w-3.5 mr-2" /> Horizontal Divider</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Page Button directly in Toolbar */}
          {onAddPage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddPage}
              className="h-7 px-2.5 text-xs gap-1.5 bg-primary/10 text-primary border-primary/30 font-semibold hover:bg-primary/20 shadow-2xs"
              title="Add a new blank page to this document"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Page</span>
            </Button>
          )}

          {/* More Formatting Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex items-center gap-0.5 h-7 px-1.5 rounded-md text-xs hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="More Formatting">
                <span>More</span>
                <ChevronDown className="h-2.5 w-2.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 text-xs">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Alignment</DropdownMenuLabel>
              <div className="flex items-center gap-1 py-1">
                <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left"><AlignLeft className="h-3.5 w-3.5" /></TBtn>
                <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter className="h-3.5 w-3.5" /></TBtn>
                <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right"><AlignRight className="h-3.5 w-3.5" /></TBtn>
                <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify className="h-3.5 w-3.5" /></TBtn>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Lists</DropdownMenuLabel>
              <div className="flex items-center gap-1 py-1">
                <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List className="h-3.5 w-3.5" /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered className="h-3.5 w-3.5" /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Checklist"><ListChecks className="h-3.5 w-3.5" /></TBtn>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-3.5 w-3.5 mr-2" /> Strikethrough</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()}><Code className="h-3.5 w-3.5 mr-2" /> Inline Code</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleSuperscript().run()}><SuperscriptIcon className="h-3.5 w-3.5 mr-2" /> Superscript</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleSubscript().run()}><SubscriptIcon className="h-3.5 w-3.5 mr-2" /> Subscript</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting className="h-3.5 w-3.5 mr-2 text-destructive" /> Clear Formatting</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Link Input Bar */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border bg-muted/30">
            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setShowLinkInput(false) }}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button onClick={applyLink} className="text-xs text-primary hover:underline font-medium">Apply</button>
            <button onClick={() => setShowLinkInput(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        )}
      </div>

      <ImageUploadModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsertImage={handleInsertImage}
      />
    </TooltipProvider>
  )
}

// ── Headless/Combined Editor Component ─────────────────────────────────────────
interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  editable?: boolean
  onEditorReady?: (editor: Editor) => void
}

export function TiptapEditor({ content, onChange, editable = true, onEditorReady }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline underline-offset-2 hover:text-primary/80' } }),
      ResizableImage,
      Placeholder.configure({ placeholder: 'Start typing your document…' }),
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Superscript,
      Subscript,
      Typography,
      Focus.configure({ className: 'has-focus', mode: 'all' }),
      BorderBox,
      PageBreak,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) editor.setEditable(editable)
  }, [editable, editor])

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  if (!editor) return null

  return (
    <EditorContent editor={editor} className="tiptap-editor focus:outline-none" />
  )
}
