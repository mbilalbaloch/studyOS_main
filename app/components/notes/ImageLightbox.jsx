"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";

export default function ImageLightbox({ images, currentIndex, onClose, onNavigate }) {
  const [scale, setScale] = useState(1);
  const currentImage = images[currentIndex];

  useEffect(() => {
    setScale(1); // Reset zoom on image change
  }, [currentIndex]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("handwritten-notes")
        .download(currentImage.storage_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.file_name || `handwritten-page-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading image:", err.message);
      alert("Failed to download image.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50">
        <div className="text-xs font-medium text-zinc-400">
          Page {currentIndex + 1} of {images.length} — <span className="text-zinc-200">{currentImage?.file_name}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleZoomIn} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleResetZoom} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Reset Zoom">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Download original">
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-6 z-10 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center overflow-auto">
          <img
            src={currentImage?.publicUrl}
            alt={currentImage?.file_name}
            style={{ transform: `scale(${scale})`, transition: "transform 0.2s ease" }}
            className="max-h-full max-w-full object-contain select-none"
          />
        </div>

        {currentIndex < images.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-6 z-10 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}