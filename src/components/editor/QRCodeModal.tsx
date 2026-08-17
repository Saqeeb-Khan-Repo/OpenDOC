import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Plus } from 'lucide-react';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (imgHtml: string, qrData: { text: string; fgColor: string; bgColor: string }) => void;
}

export function QRCodeModal({ open, onClose, onInsert }: QRCodeModalProps) {
  const [text, setText] = useState('https://opendoc-studio.example.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [size, setSize] = useState(160);

  // Generate QR Code image url using standard quickchart/google charts format or SVG data
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&margin=1`;

  const handleInsert = () => {
    if (!text.trim()) return;
    const imgHtml = `
      <div class="qr-container my-4 text-center">
        <img src="${qrUrl}" alt="QR Code: ${text}" width="${size}" height="${size}" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: inline-block;" />
        <p class="text-[11px] text-muted-foreground mt-1">${text}</p>
      </div>
    `;
    onInsert(imgHtml, { text, fgColor, bgColor });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            QR Code Generator
          </DialogTitle>
          <DialogDescription>
            Generate custom QR codes for web URLs, emails, phone numbers, or plain text.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-muted/20">
            <img
              src={qrUrl}
              alt="QR Code Preview"
              className="w-36 h-36 rounded-lg shadow-sm bg-white p-2 border border-border"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Target URL or Data</label>
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="https://example.com"
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Foreground Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                  className="h-8 w-10 p-0 rounded border cursor-pointer"
                />
                <Input value={fgColor} onChange={e => setFgColor(e.target.value)} className="h-8 text-xs font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="h-8 w-10 p-0 rounded border cursor-pointer"
                />
                <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 text-xs font-mono" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInsert} className="gap-1.5">
            <Plus className="h-4 w-4" /> Insert QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
