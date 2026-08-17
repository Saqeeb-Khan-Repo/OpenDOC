import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImageNode } from './ResizableImageNode';

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string | number;
        align?: 'left' | 'center' | 'right';
        imageId?: string;
      }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({ src: attributes.src }),
      },
      alt: {
        default: null,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({ alt: attributes.alt }),
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => ({ title: attributes.title }),
      },
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width') || element.style.width || '100%',
        renderHTML: attributes => ({ width: attributes.width, style: `width: ${attributes.width}; max-width: 100%;` }),
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => ({ 'data-align': attributes.align }),
      },
      imageId: {
        default: null,
        parseHTML: element => element.getAttribute('data-image-id'),
        renderHTML: attributes => ({ 'data-image-id': attributes.imageId }),
      },
      borderRadius: {
        default: '8px',
        parseHTML: element => element.getAttribute('data-border-radius') || '8px',
        renderHTML: attributes => ({ 'data-border-radius': attributes.borderRadius }),
      },
      shadow: {
        default: 'sm',
        parseHTML: element => element.getAttribute('data-shadow') || 'sm',
        renderHTML: attributes => ({ 'data-shadow': attributes.shadow }),
      },
      rotate: {
        default: 0,
        parseHTML: element => Number(element.getAttribute('data-rotate')) || 0,
        renderHTML: attributes => ({ 'data-rotate': attributes.rotate }),
      },
      opacity: {
        default: 1,
        parseHTML: element => Number(element.getAttribute('data-opacity')) || 1,
        renderHTML: attributes => ({ 'data-opacity': attributes.opacity }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
      {
        tag: 'div[data-type="resizable-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
