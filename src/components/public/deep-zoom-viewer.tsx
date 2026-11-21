"use client";

import { RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";

export function DeepZoomViewer({
  src,
  alt,
  open,
  onClose,
}: {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1.5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex flex-col bg-ink-950/95 text-board-50"
    >
      <div className="flex items-center justify-between border-b border-board-50/15 px-4 py-3 sm:px-6">
        <p className="truncate font-serif text-base font-light sm:text-lg">{alt}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(1, Number((s - 0.5).toFixed(2))))}
            aria-label="Zoom out"
            className="border border-board-50/20 p-2 hover:border-board-50"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="w-12 text-center font-mono text-xs">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(4, Number((s + 0.5).toFixed(2))))}
            aria-label="Zoom in"
            className="border border-board-50/20 p-2 hover:border-board-50"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(1.5);
              setOffset({ x: 0, y: 0 });
            }}
            aria-label="Reset zoom"
            className="border border-board-50/20 p-2 hover:border-board-50"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close zoom viewer"
            className="ml-2 border border-board-50/30 bg-board-50/10 p-2 hover:bg-oxide"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-1 cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
        onPointerDown={(e) => {
          setDragging(true);
          setOrigin({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setOffset({ x: e.clientX - origin.x, y: e.clientY - origin.y });
        }}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {/* biome-ignore lint/performance/noImgElement: High-resolution zoomable R2 image plate. */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: dragging ? "none" : "transform 160ms ease-out",
          }}
          className="max-h-[85vh] max-w-[90vw] select-none object-contain"
        />
      </div>
    </div>
  );
}
