import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PenTool, Type, Upload, Eraser, Plus } from 'lucide-react';

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (imgHtml: string, sigData: { type: string; url?: string; text?: string }) => void;
}

export function SignatureModal({ open, onClose, onInsert }: SignatureModalProps) {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('Saqeeb Khan');
  const [typedFont, setTypedFont] = useState('Great Vibes');
  const [penColor, setPenColor] = useState('#0F172A');
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (tab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2.5;
      }
    }
  }, [tab, penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const html = `<div class="signature-block my-2 inline-block"><img src="${dataUrl}" alt="Signature" style="max-height: 60px; display: block;" /><p style="font-size: 11px; border-top: 1px solid #94a3b8; margin-top: 4px; padding-top: 2px; color: #64748b;">Authorized Signatory</p></div>`;
      onInsert(html, { type: 'drawn', url: dataUrl });
    } else if (tab === 'type') {
      const html = `<div class="signature-block my-2 inline-block"><span style="font-family: 'Great Vibes', cursive, 'Brush Script MT', sans-serif; font-size: 28px; color: #1e3a8a; display: block;">${typedName}</span><p style="font-size: 11px; border-top: 1px solid #94a3b8; margin-top: 4px; padding-top: 2px; color: #64748b;">Authorized Signatory</p></div>`;
      onInsert(html, { type: 'typed', text: typedName });
    } else if (tab === 'upload' && uploadedImg) {
      const html = `<div class="signature-block my-2 inline-block"><img src="${uploadedImg}" alt="Uploaded Signature" style="max-height: 60px; display: block;" /><p style="font-size: 11px; border-top: 1px solid #94a3b8; margin-top: 4px; padding-top: 2px; color: #64748b;">Authorized Signatory</p></div>`;
      onInsert(html, { type: 'uploaded', url: uploadedImg });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Digital Signature Tool
          </DialogTitle>
          <DialogDescription>
            Create an authentic signature by drawing, calligraphy typing, or uploading.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('draw')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'draw' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            <PenTool className="h-3.5 w-3.5" /> Draw
          </button>
          <button
            type="button"
            onClick={() => setTab('type')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'type' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            <Type className="h-3.5 w-3.5" /> Type
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>

        {/* Draw Mode */}
        {tab === 'draw' && (
          <div className="space-y-3 pt-2">
            <div className="relative border-2 border-dashed border-border rounded-xl bg-card overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair w-full h-[160px] bg-white"
              />
              <button
                type="button"
                onClick={clearCanvas}
                className="absolute top-2 right-2 text-xs bg-muted/80 hover:bg-muted p-1.5 rounded-md flex items-center gap-1 text-muted-foreground transition-colors"
              >
                <Eraser className="h-3 w-3" /> Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Ink Color:</span>
              {['#0F172A', '#1E3A8A', '#059669', '#7C2D12'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPenColor(c)}
                  className={`h-5 w-5 rounded-full border ${penColor === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Type Mode */}
        {tab === 'type' && (
          <div className="space-y-3 pt-2">
            <Input
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder="Your Full Name"
              className="text-sm"
            />
            <div className="p-6 rounded-xl border border-border bg-muted/20 flex items-center justify-center min-h-[120px]">
              <span style={{ fontFamily: "'Great Vibes', cursive, 'Brush Script MT', sans-serif", fontSize: '36px', color: '#1E3A8A' }}>
                {typedName || 'Signatory Name'}
              </span>
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {tab === 'upload' && (
          <div className="space-y-3 pt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer w-full"
            />
            {uploadedImg && (
              <div className="p-4 rounded-xl border border-border bg-white flex items-center justify-center min-h-[100px]">
                <img src={uploadedImg} alt="Preview" className="max-h-24 max-w-full object-contain" />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInsert} className="gap-1.5">
            <Plus className="h-4 w-4" /> Insert Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
