import { CanvasElement, ElementTransform, ElementStyle, ShapeType, ElementType } from './types';

export class ElementEngine {
  /**
   * Generates a new unique element with default bounds and styles
   */
  static createElement(
    type: ElementType,
    overrides?: Partial<CanvasElement>
  ): CanvasElement {
    const id = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultTransform: ElementTransform = {
      x: 60,
      y: 60,
      width: type === 'text' ? 240 : type === 'qrcode' || type === 'signature' ? 160 : 200,
      height: type === 'text' ? 100 : type === 'qrcode' || type === 'signature' ? 160 : 160,
      rotation: 0,
    };

    let initialFontSize = 24;
    if (overrides?.style?.fontSize) {
      initialFontSize = overrides.style.fontSize;
    } else if (typeof overrides?.content === 'string') {
      const match = overrides.content.match(/font-size:\s*(\d+)px/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) initialFontSize = parsed;
      }
    }

    const defaultStyle: ElementStyle = {
      fill: type === 'shape' ? '#3B82F6' : '#ffffff',
      stroke: type === 'shape' ? '#1D4ED8' : '#e2e8f0',
      strokeWidth: 1,
      strokeStyle: 'solid',
      cornerRadius: 8,
      opacity: 1,
      fontFamily: 'Inter',
      fontSize: initialFontSize,
      color: '#1e293b',
      textAlign: 'left',
      padding: 12,
    };

    return {
      id,
      type,
      transform: defaultTransform,
      style: {
        ...defaultStyle,
        ...overrides?.style,
        fontSize: overrides?.style?.fontSize || initialFontSize,
      },
      zIndex: 1,
      locked: false,
      hidden: false,
      shapeType: type === 'shape' ? 'rectangle' : undefined,
      content: type === 'text' ? '<p>Double-click or edit this text box...</p>' : undefined,
      ...overrides,
    };
  }

  /**
   * Layer Ordering Operations (z-index)
   */
  static bringForward(elements: CanvasElement[], elementId: string): CanvasElement[] {
    const idx = elements.findIndex(e => e.id === elementId);
    if (idx === -1 || idx === elements.length - 1) return elements;

    const copy = [...elements];
    const temp = copy[idx];
    copy[idx] = copy[idx + 1];
    copy[idx + 1] = temp;
    return this.reindexLayers(copy);
  }

  static sendBackward(elements: CanvasElement[], elementId: string): CanvasElement[] {
    const idx = elements.findIndex(e => e.id === elementId);
    if (idx <= 0) return elements;

    const copy = [...elements];
    const temp = copy[idx];
    copy[idx] = copy[idx - 1];
    copy[idx - 1] = temp;
    return this.reindexLayers(copy);
  }

  static bringToFront(elements: CanvasElement[], elementId: string): CanvasElement[] {
    const target = elements.find(e => e.id === elementId);
    if (!target) return elements;
    const others = elements.filter(e => e.id !== elementId);
    return this.reindexLayers([...others, target]);
  }

  static sendToBack(elements: CanvasElement[], elementId: string): CanvasElement[] {
    const target = elements.find(e => e.id === elementId);
    if (!target) return elements;
    const others = elements.filter(e => e.id !== elementId);
    return this.reindexLayers([target, ...others]);
  }

  private static reindexLayers(elements: CanvasElement[]): CanvasElement[] {
    return elements.map((el, i) => ({ ...el, zIndex: i + 1 }));
  }

  /**
   * Grouping Operations
   */
  static groupElements(elements: CanvasElement[], selectedIds: string[]): CanvasElement[] {
    if (selectedIds.length < 2) return elements;
    const groupId = `group_${Date.now()}`;
    return elements.map(el => {
      if (selectedIds.includes(el.id)) {
        return { ...el, groupId };
      }
      return el;
    });
  }

  static ungroupElements(elements: CanvasElement[], groupId: string): CanvasElement[] {
    return elements.map(el => {
      if (el.groupId === groupId) {
        const { groupId: _, ...rest } = el;
        return rest as CanvasElement;
      }
      return el;
    });
  }

  /**
   * Snap position to grid (e.g. 10px or 20px)
   */
  static snap(value: number, gridSize = 10): number {
    return Math.round(value / gridSize) * gridSize;
  }

  /**
   * Alignment distribution
   */
  static alignElements(
    elements: CanvasElement[],
    selectedIds: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ): CanvasElement[] {
    const selected = elements.filter(e => selectedIds.includes(e.id));
    if (selected.length < 2) return elements;

    let targetValue = 0;
    if (alignment === 'left') {
      targetValue = Math.min(...selected.map(e => e.transform.x));
    } else if (alignment === 'right') {
      targetValue = Math.max(...selected.map(e => e.transform.x + e.transform.width));
    } else if (alignment === 'top') {
      targetValue = Math.min(...selected.map(e => e.transform.y));
    } else if (alignment === 'bottom') {
      targetValue = Math.max(...selected.map(e => e.transform.y + e.transform.height));
    } else if (alignment === 'center') {
      const minX = Math.min(...selected.map(e => e.transform.x));
      const maxX = Math.max(...selected.map(e => e.transform.x + e.transform.width));
      targetValue = (minX + maxX) / 2;
    } else if (alignment === 'middle') {
      const minY = Math.min(...selected.map(e => e.transform.y));
      const maxY = Math.max(...selected.map(e => e.transform.y + e.transform.height));
      targetValue = (minY + maxY) / 2;
    }

    return elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;

      const newT = { ...el.transform };
      if (alignment === 'left') newT.x = targetValue;
      if (alignment === 'right') newT.x = targetValue - newT.width;
      if (alignment === 'top') newT.y = targetValue;
      if (alignment === 'bottom') newT.y = targetValue - newT.height;
      if (alignment === 'center') newT.x = targetValue - newT.width / 2;
      if (alignment === 'middle') newT.y = targetValue - newT.height / 2;

      return { ...el, transform: newT };
    });
  }

  /**
   * Retrieves the effective font size of an element, prioritizing style.fontSize,
   * falling back to parsed inline HTML styles, and defaulting to 24px.
   */
  static getElementFontSize(el: CanvasElement | null | undefined): number {
    if (!el) return 24;
    if (typeof el.style?.fontSize === 'number' && el.style.fontSize > 0) {
      return el.style.fontSize;
    }
    if (typeof el.content === 'string') {
      const match = el.content.match(/font-size:\s*(\d+)px/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return 24;
  }

  /**
   * Updates the font size of a canvas element both in its style object
   * AND by rewriting any inline HTML style attributes inside content.
   * This guarantees immediate, reliable canvas and DOM rendering without CSS conflicts.
   */
  static updateElementFontSize(el: CanvasElement, newFontSize: number): CanvasElement {
    const validSize = Math.min(144, Math.max(8, Math.round(newFontSize)));
    if (isNaN(validSize)) return el;

    let nextContent = el.content;
    if (typeof nextContent === 'string' && nextContent.trim().length > 0) {
      if (/font-size:\s*[^;"]+/i.test(nextContent)) {
        nextContent = nextContent.replace(/font-size:\s*[^;"]+/gi, `font-size: ${validSize}px`);
      } else {
        nextContent = `<div style="font-size: ${validSize}px;">${nextContent}</div>`;
      }
    }

    return {
      ...el,
      content: nextContent,
      style: {
        ...el.style,
        fontSize: validSize,
      },
    };
  }

  /**
   * Batch updates font size across all matching element IDs (e.g. for multi-selection).
   */
  static updateElementsFontSize(
    elements: CanvasElement[],
    targetIds: string[],
    newFontSize: number
  ): CanvasElement[] {
    return elements.map(el => {
      if (targetIds.includes(el.id)) {
        return this.updateElementFontSize(el, newFontSize);
      }
      return el;
    });
  }
}
