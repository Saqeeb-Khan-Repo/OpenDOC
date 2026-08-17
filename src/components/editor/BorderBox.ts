import { Node, mergeAttributes, Command, RawCommands } from '@tiptap/core'

export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double'
export type BorderType = 'full' | 'left' | 'top' | 'bottom' | 'none'

export interface BorderBoxOptions {
  HTMLAttributes: Record<string, string>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    borderBox: {
      setBorderBox: (attrs?: { color?: string; style?: BorderStyle; type?: BorderType }) => ReturnType
      unsetBorderBox: () => ReturnType
      toggleBorderBox: (attrs?: { color?: string; style?: BorderStyle; type?: BorderType }) => ReturnType
    }
  }
}

function getBorderStyle(type: BorderType, color: string, style: BorderStyle): string {
  const borderValue = `2px ${style} ${color}`
  switch (type) {
    case 'full':    return `border: ${borderValue}; border-radius: 6px; padding: 12px 16px; margin: 8px 0;`
    case 'left':   return `border-left: 4px ${style} ${color}; padding: 8px 16px; margin: 8px 0;`
    case 'top':    return `border-top: ${borderValue}; padding-top: 12px; margin: 8px 0;`
    case 'bottom': return `border-bottom: ${borderValue}; padding-bottom: 12px; margin: 8px 0;`
    default:       return 'padding: 8px 0; margin: 8px 0;'
  }
}

export const BorderBox = Node.create<BorderBoxOptions>({
  name: 'borderBox',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: false,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      color:  { default: '#94a3b8', parseHTML: el => el.getAttribute('data-color')  ?? '#94a3b8', renderHTML: attrs => ({ 'data-color': attrs.color }) },
      style:  { default: 'solid',   parseHTML: el => el.getAttribute('data-style')  ?? 'solid',   renderHTML: attrs => ({ 'data-style': attrs.style }) },
      btype:  { default: 'full',    parseHTML: el => el.getAttribute('data-btype')  ?? 'full',    renderHTML: attrs => ({ 'data-btype': attrs.btype }) },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-border-box]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    const { color = '#94a3b8', style = 'solid', btype = 'full' } = node.attrs
    const inlineStyle = getBorderStyle(btype as BorderType, color as string, style as BorderStyle)
    return [
      'div',
      mergeAttributes({ 'data-border-box': '' }, this.options.HTMLAttributes, HTMLAttributes, { style: inlineStyle }),
      0,
    ]
  },

  addCommands() {
    return {
      setBorderBox:
        (attrs = {}) =>
        ({ commands }: { commands: any }) => {
          return commands.wrapIn(this.name, {
            color: attrs.color ?? '#94a3b8',
            style: attrs.style ?? 'solid',
            btype: attrs.type  ?? 'full',
          })
        },

      unsetBorderBox:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.lift(this.name)
        },

      toggleBorderBox:
        (attrs = {}) =>
        ({ commands, editor }: { commands: any; editor: any }) => {
          if (editor.isActive('borderBox')) {
            return commands.lift(this.name)
          }
          return commands.wrapIn(this.name, {
            color: attrs.color ?? '#94a3b8',
            style: attrs.style ?? 'solid',
            btype: attrs.type  ?? 'full',
          })
        },
    } as Partial<RawCommands>
  },
})
