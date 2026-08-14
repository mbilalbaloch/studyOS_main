"use client";

import React, { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { X, Upload, Trash2, Loader2 } from "lucide-react";

export default function CreateNoteModal({ chapterId, onClose, onNoteCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validImages = files.filter(file => file.type.startsWith("image/"));
    if (validImages.length !== files.length) {
      setErrorMsg("Please upload image files only (JPG, PNG, WEBP).");
    } else {
      setErrorMsg("");
    }

    const newFiles = validImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a topic title.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      // 1. Verify active session and get verified auth user ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error("Your session has expired. Please log in again.");
      }
      const currentUserId = session.user.id;

      // 2. Insert Note Topic (explicitly passing user_id matching session)
      const { data: topicData, error: topicError } = await supabase
        .from("note_topics")
        .insert({
          user_id: currentUserId,
          chapter_id: chapterId,
          title: title.trim(),
          description: description.trim() || null
        })
        .select()
        .single();

      if (topicError) throw topicError;
      const topicId = topicData.id;

      // 3. Upload Images and Register Records
      const uploadedImages = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const { file, name } = selectedFiles[i];
        const fileExt = name.split(".").pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const storagePath = `${currentUserId}/${chapterId}/${topicId}/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("handwritten-notes")
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        uploadedImages.push({
          note_topic_id: topicId,
          user_id: currentUserId,
          storage_path: storagePath,
          file_name: name
        });
      }

      if (uploadedImages.length > 0) {
        const { error: imagesError } = await supabase
          .from("note_images")
          .insert(uploadedImages);

        if (imagesError) throw imagesError;
      }

      // 4. Fetch the complete newly created topic with images attached
      const { data: fullTopic, error: fetchError } = await supabase
        .from("note_topics")
        .select("*, note_images(*)")
        .eq("id", topicId)
        .single();

      if (fetchError) throw fetchError;

      onNoteCreated(fullTopic);
      onClose();
    } catch (err) {
      console.error("Error creating handwritten note topic:", err.message);
      setErrorMsg(err.message || "Failed to save handwritten notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 my-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-zinc-100">Create Handwritten Note Topic</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Group multiple notebook pages under a single topic.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Topic Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Laws of Thermodynamics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Description (Optional)</label>
            <textarea
              placeholder="Add short summary or page range notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-400">Notebook Pages (Images)</label>
              <span className="text-xs text-zinc-500">{selectedFiles.length} selected</span>
            </div>

            <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition group">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-xs text-zinc-300 font-medium text-center">
                Click to upload notebook pages
              </div>
              <div className="text-[11px] text-zinc-500 text-center">
                Supports multiple JPG, PNG, WEBP images
              </div>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
              {selectedFiles.map((fileObj, idx) => (
                <div key={idx} className="relative group aspect-square bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                  <img src={fileObj.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white p-1 rounded-md transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-zinc-100 hover:bg-white text-zinc-950 px-5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? "Uploading Pages..." : "Save Notes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}