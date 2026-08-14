"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { ArrowLeft, Plus, Trash2, Edit2, FileText, Download } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

export default function NoteDetailView({ topic: initialTopic, onBack, onTopicUpdated }) {
  const [topic, setTopic] = useState(initialTopic);
  const [imagesWithUrls, setImagesWithUrls] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loadingImages, setLoadingImages] = useState(true);

  // Load secure public/signed URLs for private bucket images
  useEffect(() => {
    async function loadImages() {
      if (!topic.note_images || topic.note_images.length === 0) {
        setImagesWithUrls([]);
        setLoadingImages(false);
        return;
      }

      const processed = await Promise.all(
        topic.note_images.map(async (img) => {
          // Generate a signed URL valid for 1 hour for secure private buckets
          const { data, error } = await supabase.storage
            .from("handwritten-notes")
            .createSignedUrl(img.storage_path, 3600);

          return {
            ...img,
            publicUrl: error ? null : data.signedUrl
          };
        })
      );

      setImagesWithUrls(processed);
      setLoadingImages(false);
    }

    loadImages();
  }, [topic]);

  const handleDeleteImage = async (imageId, storagePath) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from("handwritten-notes")
        .remove([storagePath]);

      if (storageError) console.error("Storage delete warning:", storageError.message);

      // 2. Delete database record
      const { error: dbError } = await supabase
        .from("note_images")
        .delete()
        .eq("id", imageId);

      if (dbError) throw dbError;

      const updatedImages = topic.note_images.filter(img => img.id !== imageId);
      const updatedTopic = { ...topic, note_images: updatedImages };
      setTopic(updatedTopic);
      onTopicUpdated(updatedTopic);
    } catch (err) {
      console.error("Error deleting image:", err.message);
      alert("Failed to delete page.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
            title="Back to topics"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">{topic.title}</h2>
            {topic.description && <p className="text-xs text-zinc-400 mt-0.5">{topic.description}</p>}
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-300">
            Notebook Pages ({imagesWithUrls.length})
          </h3>
        </div>

        {loadingImages ? (
          <div className="text-zinc-500 text-xs py-12 text-center">Loading pages...</div>
        ) : imagesWithUrls.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-xs">
            No pages found for this topic.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagesWithUrls.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-[3/4] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-xl overflow-hidden cursor-pointer transition flex items-center justify-center shadow-sm"
              >
                {img.publicUrl ? (
                  <img src={img.publicUrl} alt={img.file_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-zinc-600">Failed to load</div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-3">
                  <span className="text-[11px] font-medium text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                    Page {idx + 1}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(img.id, img.storage_path);
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-zinc-300 hover:text-white transition"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Viewer */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={imagesWithUrls}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </div>
  );
}