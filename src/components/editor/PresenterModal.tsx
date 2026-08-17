import React, { useState, useEffect } from 'react';
import { Slide, PresentationSettings } from '@/engines/types';
import { X, ChevronLeft, ChevronRight, Play, Pause, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PresenterModalProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  initialSlideIndex?: number;
  settings: PresentationSettings;
}

export function PresenterModal({ open, onClose, slides, initialSlideIndex = 0, settings }: PresenterModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showNotes, setShowNotes] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialSlideIndex);
    setSeconds(0);
  }, [open, initialSlideIndex]);

  useEffect(() => {
    if (!open || !isTimerRunning) return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [open, isTimerRunning]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        setCurrentIndex(i => Math.min(slides.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        setCurrentIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, slides.length, onClose]);

  if (!open || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const nextSlide = currentIndex < slides.length - 1 ? slides[currentIndex + 1] : null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none">
      {/* Top Presenter Bar */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm tracking-wide text-zinc-300">
            OpenDoc Presenter Mode
          </span>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-full text-zinc-300">
            Slide {currentIndex + 1} of {slides.length}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-sm bg-white/5 px-3 py-1 rounded-lg border border-white/10">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{formatTimer(seconds)}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="text-white hover:bg-white/10"
          >
            {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowNotes(!showNotes)}
            className={`text-white hover:bg-white/10 ${showNotes ? 'bg-white/20' : ''}`}
            title="Toggle Speaker Notes"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Presentation View */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Main Stage Slide */}
        <div className="flex-1 flex items-center justify-center bg-zinc-900/50 rounded-2xl p-4 overflow-hidden relative">
          <div
            className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl overflow-hidden relative transition-all duration-300"
            style={{ background: currentSlide.gradient || currentSlide.background || settings.theme.backgroundColor }}
          >
            {currentSlide.elements.map(el => (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${(el.transform.x / 960) * 100}%`,
                  top: `${(el.transform.y / 540) * 100}%`,
                  width: `${(el.transform.width / 960) * 100}%`,
                  height: `${(el.transform.height / 540) * 100}%`,
                  ...el.style,
                }}
                dangerouslySetInnerHTML={{ __html: el.content || '' }}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 disabled:opacity-20 flex items-center justify-center text-white transition-all shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrentIndex(i => Math.min(slides.length - 1, i + 1))}
            disabled={currentIndex === slides.length - 1}
            className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 disabled:opacity-20 flex items-center justify-center text-white transition-all shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar: Next Slide & Speaker Notes */}
        {showNotes && (
          <div className="w-80 flex flex-col gap-4">
            {/* Next Slide Preview */}
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-3">
              <span className="text-xs font-semibold text-zinc-400 block mb-2">Next Slide</span>
              {nextSlide ? (
                <div
                  className="w-full aspect-video rounded-lg bg-zinc-800 p-2 overflow-hidden text-[9px] relative opacity-80"
                  style={{ background: nextSlide.gradient || nextSlide.background || settings.theme.backgroundColor }}
                >
                  <p className="font-bold truncate text-white">{nextSlide.title}</p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">End of presentation</p>
              )}
            </div>

            {/* Speaker Notes */}
            <div className="flex-1 rounded-xl border border-white/10 bg-zinc-900 p-4 flex flex-col">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5 text-primary" /> Speaker Notes
              </span>
              <div className="flex-1 overflow-y-auto text-sm text-zinc-300 leading-relaxed font-sans">
                {currentSlide.speakerNotes || (
                  <p className="text-zinc-600 italic">No notes written for this slide.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
