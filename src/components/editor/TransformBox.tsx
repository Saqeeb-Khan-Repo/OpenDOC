import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, ShapeType } from '@/engines/types';
import {
  Copy, Trash2, ArrowUp, ArrowDown, Lock, Unlock,
  RotateCw, Palette, Type, Sliders, Edit3, Image as ImageIcon,
  BarChart3, GitFork, Square
} from 'lucide-react';

interface TransformBoxProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onOpenEditModal?: (type: string) => void;
  scale?: number;
}

type HandleDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const PRESET_FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];
const COLOR_SWATCHES = ['#000000', '#ffffff', '#2563eb', '#1e3a8a', '#7c3aed', '#db2777', '#ea580c', '#059669', '#334155'];

export function TransformBox({
  element,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onOpenEditModal,
  scale = 1,
}: TransformBoxProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizingHandle, setResizingHandle] = useState<HandleDirection | null>(null);
  const startPos = useRef({ x: 0, y: 0, elX: 0, elY: 0, elW: 0, elH: 0 });

  const { transform, style, type } = element;

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked || isEditingText) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      elX: transform.x,
      elY: transform.y,
      elW: transform.width,
      elH: transform.height,
    };
  };

  // Resize Handle logic
  const handleResizeStart = (e: React.MouseEvent, handle: HandleDirection) => {
    if (element.locked) return;
    e.stopPropagation();
    onSelect();
    setResizingHandle(handle);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      elX: transform.x,
      elY: transform.y,
      elW: transform.width,
      elH: transform.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - startPos.current.x) / scale;
        const dy = (e.clientY - startPos.current.y) / scale;
        onChange({
          transform: {
            ...transform,
            x: Math.round(startPos.current.elX + dx),
            y: Math.round(startPos.current.elY + dy),
          },
        });
      } else if (resizingHandle) {
        const dx = (e.clientX - startPos.current.x) / scale;
        const dy = (e.clientY - startPos.current.y) / scale;

        let newX = startPos.current.elX;
        let newY = startPos.current.elY;
        let newW = startPos.current.elW;
        let newH = startPos.current.elH;

        if (resizingHandle.includes('e')) newW = Math.max(30, startPos.current.elW + dx);
        if (resizingHandle.includes('s')) newH = Math.max(30, startPos.current.elH + dy);
        if (resizingHandle.includes('w')) {
          const w = Math.max(30, startPos.current.elW - dx);
          newX = startPos.current.elX + (startPos.current.elW - w);
          newW = w;
        }
        if (resizingHandle.includes('n')) {
          const h = Math.max(30, startPos.current.elH - dy);
          newY = startPos.current.elY + (startPos.current.elH - h);
          newH = h;
        }

        onChange({
          transform: {
            ...transform,
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizingHandle(null);
    };

    if (isDragging || resizingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, resizingHandle, onChange, transform, scale]);

  const handleDoubleClick = () => {
    if (type === 'text') {
      setIsEditingText(true);
    } else if (['chart', 'diagram', 'equation'].includes(type) && onOpenEditModal) {
      onOpenEditModal(type);
    }
  };

  const handleBlurText = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditingText(false);
    onChange({ content: e.currentTarget.innerHTML });
  };

  // Font Size Stepper helper
  const handleFontSizeChange = (delta: number) => {
    const currentSize = style?.fontSize || 20;
    const next = Math.max(8, Math.min(144, currentSize + delta));
    onChange({ style: { ...style, fontSize: next } });
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: `${transform.x}px`,
        top: `${transform.y}px`,
        width: `${transform.width}px`,
        height: `${transform.height}px`,
        transform: `rotate(${transform.rotation || 0}deg)`,
        zIndex: element.zIndex || 1,
        cursor: element.locked ? 'default' : isEditingText ? 'text' : isDragging ? 'grabbing' : 'grab',
      }}
      className={`relative select-none ${isSelected ? 'ring-2 ring-primary ring-offset-1 rounded-sm' : ''}`}
    >
      {/* ── Contextual Floating Toolbar (Canva-Style) ───────────────────────── */}
      {isSelected && !isDragging && !resizingHandle && (
        <div
          className="absolute -top-12 left-0 bg-background/95 backdrop-blur border border-border shadow-xl rounded-lg px-2 py-1 flex items-center gap-1.5 z-50 select-none text-xs"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          {/* Text Controls */}
          {type === 'text' && (
            <>
              {/* Font Size Stepper */}
              <div className="flex items-center bg-muted/60 rounded border border-border/80 px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(-2)}
                  className="h-5 w-5 flex items-center justify-center hover:bg-accent rounded text-xs font-bold"
                  title="Decrease font size"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono text-[11px] font-semibold">
                  {style?.fontSize || 20}
                </span>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(2)}
                  className="h-5 w-5 flex items-center justify-center hover:bg-accent rounded text-xs font-bold"
                  title="Increase font size"
                >
                  +
                </button>
              </div>

              {/* Bold / Italic */}
              <button
                type="button"
                onClick={() => onChange({ style: { ...style, fontWeight: style?.fontWeight === 'bold' ? 'normal' : 'bold' } })}
                className={`h-6 w-6 rounded font-bold flex items-center justify-center ${style?.fontWeight === 'bold' ? 'bg-primary text-white' : 'hover:bg-accent'}`}
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => onChange({ style: { ...style, fontStyle: style?.fontStyle === 'italic' ? 'normal' : 'italic' } })}
                className={`h-6 w-6 rounded italic flex items-center justify-center ${style?.fontStyle === 'italic' ? 'bg-primary text-white' : 'hover:bg-accent'}`}
                title="Italic"
              >
                I
              </button>

              {/* Text Color Swatches */}
              <div className="flex items-center gap-1 border-l border-border pl-1.5">
                {COLOR_SWATCHES.slice(0, 4).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange({ style: { ...style, color: c } })}
                    className="h-4 w-4 rounded-full border border-border/60 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={style?.color || '#000000'}
                  onChange={e => onChange({ style: { ...style, color: e.target.value } })}
                  className="h-5 w-5 rounded border cursor-pointer p-0"
                />
              </div>

              <div className="h-4 w-px bg-border mx-0.5" />
            </>
          )}

          {/* Shape Controls */}
          {type === 'shape' && (
            <>
              {/* Fill Color */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Fill</span>
                <input
                  type="color"
                  value={style?.fill || '#3b82f6'}
                  onChange={e => onChange({ style: { ...style, fill: e.target.value } })}
                  className="h-5 w-5 rounded border cursor-pointer p-0"
                />
              </div>

              {/* Border Color */}
              <div className="flex items-center gap-1 border-l border-border pl-1.5">
                <span className="text-[10px] text-muted-foreground">Border</span>
                <input
                  type="color"
                  value={style?.stroke || '#1e3a8a'}
                  onChange={e => onChange({ style: { ...style, stroke: e.target.value } })}
                  className="h-5 w-5 rounded border cursor-pointer p-0"
                />
              </div>

              <div className="h-4 w-px bg-border mx-0.5" />
            </>
          )}

          {/* Chart / Diagram / Equation Edit Trigger */}
          {['chart', 'diagram', 'equation'].includes(type) && (
            <button
              type="button"
              onClick={() => onOpenEditModal && onOpenEditModal(type)}
              className="px-2 py-1 bg-primary text-white rounded font-medium text-xs flex items-center gap-1 hover:bg-primary/90"
            >
              <Edit3 className="h-3 w-3" /> Edit Data
            </button>
          )}

          {/* Layer Ordering */}
          {onBringForward && (
            <button
              type="button"
              onClick={onBringForward}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="Bring Forward"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          )}
          {onSendBackward && (
            <button
              type="button"
              onClick={onSendBackward}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="Send Backward"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Duplicate & Delete */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
            title="Delete (Delete)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Element Render Body ─────────────────────────────────────────────── */}
      <div className="w-full h-full overflow-hidden relative pointer-events-auto">
        {type === 'text' && (
          <div
            contentEditable={isEditingText && !element.locked}
            suppressContentEditableWarning
            onBlur={handleBlurText}
            dangerouslySetInnerHTML={{ __html: element.content || '<p>Double-click to type</p>' }}
            style={{
              fontFamily: style?.fontFamily || 'Inter, sans-serif',
              fontSize: `${style?.fontSize || 20}px`,
              fontWeight: style?.fontWeight || 'normal',
              fontStyle: style?.fontStyle || 'normal',
              color: style?.color || 'inherit',
              textAlign: (style?.textAlign as any) || 'left',
              lineHeight: style?.lineHeight || 1.5,
            }}
            className="w-full h-full outline-none p-1"
          />
        )}

        {type === 'shape' && (
          <div
            className="w-full h-full flex items-center justify-center font-bold text-center"
            style={{
              backgroundColor: style?.fill || '#3B82F6',
              border: `${style?.strokeWidth || 1}px ${style?.strokeStyle || 'solid'} ${style?.stroke || '#1D4ED8'}`,
              borderRadius: `${style?.cornerRadius || 0}px`,
              opacity: style?.opacity ?? 1,
            }}
          />
        )}

        {type === 'image' && (
          <img
            src={element.content || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'}
            alt="Canvas graphic"
            className="w-full h-full object-cover rounded-sm"
            style={{
              borderRadius: `${style?.cornerRadius || 0}px`,
              opacity: style?.opacity ?? 1,
            }}
          />
        )}

        {type === 'qrcode' && (
          <div className="w-full h-full flex items-center justify-center bg-white p-2 rounded">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(element.qrData?.text || 'OpenDoc')}`}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {type === 'signature' && (
          <div className="w-full h-full flex items-center justify-center p-2">
            {element.signatureData?.signatureUrl ? (
              <img src={element.signatureData.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
            ) : (
              <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', color: '#1E3A8A' }}>
                {element.signatureData?.text || 'Authorized Signature'}
              </span>
            )}
          </div>
        )}

        {['chart', 'diagram', 'equation'].includes(type) && (
          <div
            className="w-full h-full flex items-center justify-center p-2 rounded border border-border/60 bg-card/60"
            dangerouslySetInnerHTML={{ __html: element.content || '' }}
          />
        )}
      </div>

      {/* ── 8 Resize Handles (NW, N, NE, E, SE, S, SW, W) ───────────────────── */}
      {isSelected && !element.locked && (
        <>
          {/* Top-Left */}
          <div
            onMouseDown={e => handleResizeStart(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white cursor-nwse-resize shadow-xs z-30"
          />
          {/* Top-Center */}
          <div
            onMouseDown={e => handleResizeStart(e, 'n')}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white cursor-ns-resize shadow-xs z-30"
          />
          {/* Top-Right */}
          <div
            onMouseDown={e => handleResizeStart(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white cursor-nesw-resize shadow-xs z-30"
          />
          {/* Middle-Right */}
          <div
            onMouseDown={e => handleResizeStart(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white cursor-ew-resize shadow-xs z-30"
          />
          {/* Bottom-Right */}
          <div
            onMouseDown={e => handleResizeStart(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white cursor-nwse-resize shadow-xs z-30"
          />
          {/* Bottom-Center */}
          <div
            onMouseDown={e => handleResizeStart(e, 's')}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white cursor-ns-resize shadow-xs z-30"
          />
          {/* Bottom-Left */}
          <div
            onMouseDown={e => handleResizeStart(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white cursor-nesw-resize shadow-xs z-30"
          />
          {/* Middle-Left */}
          <div
            onMouseDown={e => handleResizeStart(e, 'w')}
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white cursor-ew-resize shadow-xs z-30"
          />
        </>
      )}
    </div>
  );
}
