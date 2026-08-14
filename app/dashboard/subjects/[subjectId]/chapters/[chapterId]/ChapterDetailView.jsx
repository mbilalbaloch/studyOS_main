// "use client";

// import React, { useState, useEffect } from "react";
// import { supabase } from "@/app/lib/supabase";
// import { 
//   ArrowLeft, 
//   CheckCircle, 
//   Circle, 
//   Plus, 
//   FileText, 
//   Trash2, 
//   X, 
//   Upload, 
//   Loader2, 
//   Search, 
//   ArrowUpDown,
//   ChevronLeft,
//   ChevronRight,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
//   Download
// } from "lucide-react";

// // =========================================================================
// // 1. LIGHTBOX VIEWER COMPONENT
// // =========================================================================
// function ImageLightbox({ images, currentIndex, onClose, onNavigate }) {
//   const [scale, setScale] = useState(1);
//   const currentImage = images[currentIndex];

//   useEffect(() => {
//     setScale(1);
//   }, [currentIndex]);

//   const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
//   const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
//   const handleResetZoom = () => setScale(1);

//   const handleDownload = async () => {
//     try {
//       const { data, error } = await supabase.storage
//         .from("handwritten-notes")
//         .download(currentImage.storage_path);

//       if (error) throw error;

//       const url = window.URL.createObjectURL(data);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = currentImage.file_name || `notebook-page-${currentIndex + 1}.jpg`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (err) {
//       console.error("Error downloading image:", err.message);
//       alert("Failed to download image.");
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col">
//       <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
//         <div className="text-xs font-medium text-zinc-400">
//           Page {currentIndex + 1} of {images.length} — <span className="text-zinc-200">{currentImage?.file_name}</span>
//         </div>

//         <div className="flex items-center gap-3">
//           <button onClick={handleZoomIn} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Zoom In">
//             <ZoomIn className="w-4 h-4" />
//           </button>
//           <button onClick={handleZoomOut} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Zoom Out">
//             <ZoomOut className="w-4 h-4" />
//           </button>
//           <button onClick={handleResetZoom} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Reset Zoom">
//             <RotateCcw className="w-4 h-4" />
//           </button>
//           <button onClick={handleDownload} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Download Original">
//             <Download className="w-4 h-4" />
//           </button>
//           <div className="w-px h-4 bg-zinc-800 mx-1" />
//           <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-100 transition" title="Close">
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
//         {currentIndex > 0 && (
//           <button
//             onClick={() => onNavigate(currentIndex - 1)}
//             className="absolute left-6 z-10 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition"
//           >
//             <ChevronLeft className="w-6 h-6" />
//           </button>
//         )}

//         <div className="w-full h-full flex items-center justify-center overflow-auto">
//           <img
//             src={currentImage?.publicUrl}
//             alt={currentImage?.file_name}
//             style={{ transform: `scale(${scale})`, transition: "transform 0.2s ease" }}
//             className="max-h-full max-w-full object-contain select-none"
//           />
//         </div>

//         {currentIndex < images.length - 1 && (
//           <button
//             onClick={() => onNavigate(currentIndex + 1)}
//             className="absolute right-6 z-10 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition"
//           >
//             <ChevronRight className="w-6 h-6" />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// // =========================================================================
// // 2. CREATE NOTE MODAL COMPONENT
// // =========================================================================
// function CreateNoteModal({ user, chapterId, onClose, onNoteCreated }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     const validImages = files.filter(file => file.type.startsWith("image/"));
//     if (validImages.length !== files.length) {
//       setErrorMsg("Please upload image files only (JPG, PNG, WEBP).");
//     } else {
//       setErrorMsg("");
//     }

//     const newFiles = validImages.map(file => ({
//       file,
//       preview: URL.createObjectURL(file),
//       name: file.name
//     }));

//     setSelectedFiles(prev => [...prev, ...newFiles]);
//   };

//   const handleRemoveFile = (index) => {
//     setSelectedFiles(prev => {
//       const updated = [...prev];
//       URL.revokeObjectURL(updated[index].preview);
//       updated.splice(index, 1);
//       return updated;
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title.trim()) {
//       setErrorMsg("Please provide a topic title.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setErrorMsg("");

//       let currentUserId = user?.id;
//       if (!currentUserId) {
//         const { data: { user: authUser } } = await supabase.auth.getUser();
//         if (authUser) currentUserId = authUser.id;
//       }

//       // 1. Insert Topic
//       const { data: topicData, error: topicError } = await supabase
//         .from("note_topics")
//         .insert({
//           user_id: currentUserId,
//           chapter_id: chapterId,
//           title: title.trim(),
//           description: description.trim() || null
//         })
//         .select()
//         .single();

//       if (topicError) throw topicError;
//       const topicId = topicData.id;

//       // 2. Upload Images and Register
//       const uploadedImages = [];
//       for (let i = 0; i < selectedFiles.length; i++) {
//         const { file, name } = selectedFiles[i];
//         const fileExt = name.split(".").pop();
//         const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
//         const storagePath = `${currentUserId}/${chapterId}/${topicId}/${uniqueFileName}`;

//         const { error: uploadError } = await supabase.storage
//           .from("handwritten-notes")
//           .upload(storagePath, file);

//         if (uploadError) throw uploadError;

//         uploadedImages.push({
//           note_topic_id: topicId,
//           user_id: currentUserId,
//           storage_path: storagePath,
//           file_name: name
//         });
//       }

//       if (uploadedImages.length > 0) {
//         const { error: imagesError } = await supabase
//           .from("note_images")
//           .insert(uploadedImages);

//         if (imagesError) throw imagesError;
//       }

//       const { data: fullTopic, error: fetchError } = await supabase
//         .from("note_topics")
//         .select("*, note_images(*)")
//         .eq("id", topicId)
//         .single();

//       if (fetchError) throw fetchError;

//       onNoteCreated(fullTopic);
//       onClose();
//     } catch (err) {
//       console.error("Error creating note topic:", err.message);
//       setErrorMsg(err.message || "Failed to save handwritten notes.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
//       <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 my-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-medium text-zinc-100">Create Handwritten Note Topic</h3>
//             <p className="text-xs text-zinc-400 mt-0.5">Group multiple notebook pages under a single topic.</p>
//           </div>
//           <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition p-1">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {errorMsg && (
//           <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
//             {errorMsg}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <div>
//             <label className="block text-xs font-medium text-zinc-400 mb-1">Topic Title *</label>
//             <input
//               type="text"
//               required
//               placeholder="e.g., Laws of Thermodynamics"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-zinc-400 mb-1">Description (Optional)</label>
//             <textarea
//               placeholder="Add short summary or page range notes..."
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               rows={2}
//               className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition resize-none"
//             />
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-1">
//               <label className="block text-xs font-medium text-zinc-400">Notebook Pages (Images)</label>
//               <span className="text-xs text-zinc-500">{selectedFiles.length} selected</span>
//             </div>

//             <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition group">
//               <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition">
//                 <Upload className="w-4 h-4" />
//               </div>
//               <div className="text-xs text-zinc-300 font-medium text-center">
//                 Click to upload notebook pages
//               </div>
//               <div className="text-[11px] text-zinc-500 text-center">
//                 Supports multiple JPG, PNG, WEBP images
//               </div>
//               <input
//                 type="file"
//                 accept="image/jpeg, image/png, image/webp"
//                 multiple
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
//             </label>
//           </div>

//           {selectedFiles.length > 0 && (
//             <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
//               {selectedFiles.map((fileObj, idx) => (
//                 <div key={idx} className="relative group aspect-square bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
//                   <img src={fileObj.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveFile(idx)}
//                     className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white p-1 rounded-md transition opacity-0 group-hover:opacity-100"
//                   >
//                     <Trash2 className="w-3 h-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-zinc-100 hover:bg-white text-zinc-950 px-5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 disabled:opacity-50"
//             >
//               {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
//               <span>{loading ? "Uploading Pages..." : "Save Notes"}</span>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // =========================================================================
// // 3. NOTE DETAIL VIEW COMPONENT (Single Topic Page View)
// // =========================================================================
// function TopicDetailView({ topic: initialTopic, onBack, onTopicUpdated }) {
//   const [topic, setTopic] = useState(initialTopic);
//   const [imagesWithUrls, setImagesWithUrls] = useState([]);
//   const [lightboxIndex, setLightboxIndex] = useState(null);
//   const [loadingImages, setLoadingImages] = useState(true);

//   useEffect(() => {
//     async function loadImages() {
//       if (!topic.note_images || topic.note_images.length === 0) {
//         setImagesWithUrls([]);
//         setLoadingImages(false);
//         return;
//       }

//       const processed = await Promise.all(
//         topic.note_images.map(async (img) => {
//           const { data, error } = await supabase.storage
//             .from("handwritten-notes")
//             .createSignedUrl(img.storage_path, 3600);

//           return {
//             ...img,
//             publicUrl: error ? null : data.signedUrl
//           };
//         })
//       );

//       setImagesWithUrls(processed);
//       setLoadingImages(false);
//     }

//     loadImages();
//   }, [topic]);

//   const handleDeleteImage = async (imageId, storagePath) => {
//     if (!confirm("Are you sure you want to delete this page?")) return;

//     try {
//       await supabase.storage.from("handwritten-notes").remove([storagePath]);
//       const { error } = await supabase.from("note_images").delete().eq("id", imageId);
//       if (error) throw error;

//       const updatedImages = topic.note_images.filter(img => img.id !== imageId);
//       const updatedTopic = { ...topic, note_images: updatedImages };
//       setTopic(updatedTopic);
//       onTopicUpdated(updatedTopic);
//     } catch (err) {
//       console.error("Error deleting image:", err.message);
//       alert("Failed to delete page.");
//     }
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={onBack}
//             className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
//             title="Back to topics"
//           >
//             <ArrowLeft className="w-4 h-4" />
//           </button>
//           <div>
//             <h2 className="text-xl font-semibold text-zinc-100">{topic.title}</h2>
//             {topic.description && <p className="text-xs text-zinc-400 mt-0.5">{topic.description}</p>}
//           </div>
//         </div>
//       </div>

//       <div>
//         <h3 className="text-sm font-medium text-zinc-300 mb-4">
//           Notebook Pages ({imagesWithUrls.length})
//         </h3>

//         {loadingImages ? (
//           <div className="text-zinc-500 text-xs py-12 text-center">Loading pages...</div>
//         ) : imagesWithUrls.length === 0 ? (
//           <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-xs">
//             No pages found for this topic.
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//             {imagesWithUrls.map((img, idx) => (
//               <div
//                 key={img.id}
//                 onClick={() => setLightboxIndex(idx)}
//                 className="group relative aspect-[3/4] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-xl overflow-hidden cursor-pointer transition flex items-center justify-center shadow-sm"
//               >
//                 {img.publicUrl ? (
//                   <img src={img.publicUrl} alt={img.file_name} className="w-full h-full object-cover" />
//                 ) : (
//                   <div className="text-xs text-zinc-600">Failed to load</div>
//                 )}

//                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-3">
//                   <span className="text-[11px] font-medium text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
//                     Page {idx + 1}
//                   </span>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDeleteImage(img.id, img.storage_path);
//                     }}
//                     className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-zinc-300 hover:text-white transition"
//                     title="Delete page"
//                   >
//                     <Trash2 className="w-3.5 h-3.5" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {lightboxIndex !== null && (
//         <ImageLightbox
//           images={imagesWithUrls}
//           currentIndex={lightboxIndex}
//           onClose={() => setLightboxIndex(null)}
//           onNavigate={(newIdx) => setLightboxIndex(newIdx)}
//         />
//       )}
//     </div>
//   );
// }

// // =========================================================================
// // 4. MAIN CHAPTER DETAIL VIEW (HERO COMPONENT)
// // =========================================================================
// export default function ChapterDetailView({ user, subject, initialChapter, initialNoteTopics = [], onBack }) {
//   const [chapter, setChapter] = useState(initialChapter);
//   const [topics, setTopics] = useState(initialNoteTopics);
//   const [selectedTopic, setSelectedTopic] = useState(null);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState("updated_desc");

//   // Toggle Chapter Completion Status
//   const handleToggleComplete = async () => {
//     try {
//       const newStatus = !chapter.is_completed;
//       const { error } = await supabase
//         .from("chapters")
//         .update({ is_completed: newStatus })
//         .eq("id", chapter.id);

//       if (error) throw error;
//       setChapter(prev => ({ ...prev, is_completed: newStatus }));
//     } catch (err) {
//       console.error("Error updating chapter status:", err.message);
//     }
//   };

//   // Delete Topic Handler
//   const handleDeleteTopic = async (topicId) => {
//     if (!confirm("Are you sure you want to delete this topic and all its handwritten pages?")) return;

//     try {
//       // 1. Fetch associated images to remove from storage
//       const { data: images } = await supabase
//         .from("note_images")
//         .select("storage_path")
//         .eq("note_topic_id", topicId);

//       if (images && images.length > 0) {
//         const paths = images.map(img => img.storage_path);
//         await supabase.storage.from("handwritten-notes").remove(paths);
//       }

//       // 2. Delete topic record (cascade will handle image records)
//       const { error } = await supabase
//         .from("note_topics")
//         .delete()
//         .eq("id", topicId);

//       if (error) throw error;

//       setTopics(topics.filter(t => t.id !== topicId));
//       if (selectedTopic?.id === topicId) setSelectedTopic(null);
//     } catch (err) {
//       console.error("Error deleting note topic:", err.message);
//       alert("Failed to delete note topic.");
//     }
//   };

//   // Filter & Sort Topics
//   const filteredAndSortedTopics = React.useMemo(() => {
//     let result = [...topics];

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       result = result.filter(
//         t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
//       );
//     }

//     result.sort((a, b) => {
//       if (sortBy === "updated_desc") {
//         return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
//       } else if (sortBy === "updated_asc") {
//         return new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at);
//       } else if (sortBy === "title_asc") {
//         return a.title.localeCompare(b.title);
//       } else if (sortBy === "title_desc") {
//         return b.title.localeCompare(a.title);
//       }
//       return 0;
//     });

//     return result;
//   }, [topics, searchQuery, sortBy]);

//   return (
//     <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
//       {/* Header Bar */}
//       <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           {onBack && (
//             <button
//               onClick={onBack}
//               className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
//               title="Back to chapters"
//             >
//               <ArrowLeft className="w-4 h-4" />
//             </button>
//           )}
//           <div>
//             <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
//               {subject?.name || "Subject"}
//             </div>
//             <h1 className="text-xl font-semibold text-zinc-100 mt-0.5">
//               {chapter?.title || "Chapter"}
//             </h1>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleToggleComplete}
//             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
//               chapter?.is_completed 
//                 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
//                 : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
//             }`}
//           >
//             {chapter?.is_completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
//             <span>{chapter?.is_completed ? "Completed" : "Mark Complete"}</span>
//           </button>

//           <button
//             onClick={() => setIsCreateModalOpen(true)}
//             className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Create Note</span>
//           </button>
//         </div>
//       </header>

//       {/* Main Workspace */}
//       <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
//         {chapter?.description && !selectedTopic && (
//           <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 text-sm text-zinc-300">
//             <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Chapter Overview</h3>
//             <p>{chapter.description}</p>
//           </div>
//         )}

//         {selectedTopic ? (
//           <TopicDetailView
//             topic={selectedTopic}
//             onBack={() => setSelectedTopic(null)}
//             onTopicUpdated={(updated) => {
//               setSelectedTopic(updated);
//               setTopics(topics.map(t => t.id === updated.id ? updated : t));
//             }}
//           />
//         ) : (
//           <div className="flex flex-col gap-6">
//             <div className="flex flex-col gap-1">
//               <h2 className="text-lg font-medium text-zinc-200">My Notes</h2>
//               <p className="text-xs text-zinc-500">Keep your handwritten notes organized for this chapter.</p>
//             </div>

//             {/* Search and Sort */}
//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
//               <div className="relative flex-1 max-w-md">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
//                 <input
//                   type="text"
//                   placeholder="Search handwritten notes by topic..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400">
//                   <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
//                   >
//                     <option value="updated_desc" className="bg-zinc-900">Recently Updated</option>
//                     <option value="updated_asc" className="bg-zinc-900">Oldest Updated</option>
//                     <option value="title_asc" className="bg-zinc-900">A – Z</option>
//                     <option value="title_desc" className="bg-zinc-900">Z – A</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Gallery Grid or Empty State */}
//             {filteredAndSortedTopics.length === 0 ? (
//               <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
//                 <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
//                   <FileText className="w-6 h-6" />
//                 </div>
//                 <div className="text-zinc-300 font-medium">No notes yet</div>
//                 <p className="text-sm text-zinc-500 max-w-sm">
//                   Save your handwritten notes here and keep everything for this chapter in one place.
//                 </p>
//                 <button
//                   onClick={() => setIsCreateModalOpen(true)}
//                   className="mt-2 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition"
//                 >
//                   + Create Note
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                 {filteredAndSortedTopics.map((topic) => {
//                   const pageCount = topic.note_images?.length || 0;
//                   const updatedDate = new Date(topic.updated_at || topic.created_at).toLocaleDateString();

//                   return (
//                     <div
//                       key={topic.id}
//                       onClick={() => setSelectedTopic(topic)}
//                       className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition group"
//                     >
//                       <div className="flex flex-col gap-1">
//                         <div className="flex items-start justify-between gap-2">
//                           <h3 className="font-medium text-zinc-200 text-sm group-hover:text-white transition line-clamp-1">
//                             {topic.title}
//                           </h3>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleDeleteTopic(topic.id);
//                             }}
//                             className="text-zinc-600 hover:text-red-400 p-1 transition opacity-0 group-hover:opacity-100"
//                             title="Delete topic"
//                           >
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </button>
//                         </div>
//                         {topic.description && (
//                           <p className="text-xs text-zinc-400 line-clamp-2">{topic.description}</p>
//                         )}
//                       </div>

//                       <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
//                         <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
//                           <FileText className="w-3.5 h-3.5 text-zinc-500" />
//                           {pageCount} {pageCount === 1 ? "handwritten page" : "handwritten pages"}
//                         </span>
//                         <span>{updatedDate}</span>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}
//       </main>

//       {/* Create Note Modal */}
//       {isCreateModalOpen && (
//         <CreateNoteModal
//           user={user}
//           chapterId={chapter.id}
//           onClose={() => setIsCreateModalOpen(false)}
//           onNoteCreated={(newTopic) => {
//             setTopics([newTopic, ...topics]);
//           }}
//         />
//       )}
//     </div>
//   );
// }



"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Plus, 
  FileText, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  Search, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download
} from "lucide-react";

// =========================================================================
// 1. LIGHTBOX VIEWER COMPONENT
// =========================================================================
function ImageLightbox({ images, currentIndex, onClose, onNavigate }) {
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const currentImage = images[currentIndex];

  useEffect(() => {
    setScale(1);
  }, [currentIndex]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = async () => {
    if (!currentImage?.storage_path || isDownloading) return;
    try {
      setIsDownloading(true);
      const { data, error } = await supabase.storage
        .from("handwritten-notes")
        .download(currentImage.storage_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.file_name || `notebook-page-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading image:", err.message);
      alert("Failed to download image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
        <div className="text-xs font-medium text-zinc-400">
          Page {currentIndex + 1} of {images.length} — <span className="text-zinc-200">{currentImage?.file_name}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleZoomIn} className="p-2 text-zinc-400 hover:text-zinc-100 transition rounded-lg hover:bg-zinc-900" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-2 text-zinc-400 hover:text-zinc-100 transition rounded-lg hover:bg-zinc-900" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleResetZoom} className="p-2 text-zinc-400 hover:text-zinc-100 transition rounded-lg hover:bg-zinc-900" title="Reset Zoom">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="p-2 text-zinc-400 hover:text-zinc-100 transition rounded-lg hover:bg-zinc-900 disabled:opacity-50" 
            title="Download Original"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-100 transition rounded-lg hover:bg-zinc-900" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-6 z-10 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center overflow-auto">
          <img
            src={currentImage?.publicUrl}
            alt={currentImage?.file_name || "Notebook Page"}
            style={{ transform: `scale(${scale})`, transition: "transform 0.2s ease" }}
            className="max-h-full max-w-full object-contain select-none"
          />
        </div>

        {currentIndex < images.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-6 z-10 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 2. CREATE NOTE MODAL COMPONENT
// =========================================================================
function CreateNoteModal({ user, chapterId, onClose, onNoteCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    return () => {
      selectedFiles.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    };
  }, [selectedFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validImages = files.filter(file => file.type.startsWith("image/"));
    if (validImages.length !== files.length) {
      setErrorMsg("Some non-image files were filtered out. Please upload image files only.");
    } else {
      setErrorMsg("");
    }

    const newFiles = validImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    e.target.value = "";
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

      let currentUserId = user?.id;
      if (!currentUserId) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) throw new Error("User session not found. Please log in again.");
        currentUserId = authUser.id;
      }

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

      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async ({ file, name }) => {
          const fileExt = name.split(".").pop();
          const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const storagePath = `${currentUserId}/${chapterId}/${topicId}/${uniqueFileName}`;

          const { error: uploadError } = await supabase.storage
            .from("handwritten-notes")
            .upload(storagePath, file);

          if (uploadError) throw uploadError;

          return {
            note_topic_id: topicId,
            user_id: currentUserId,
            storage_path: storagePath,
            file_name: name
          };
        });

        const uploadedImagesPayload = await Promise.all(uploadPromises);

        const { error: imagesError } = await supabase
          .from("note_images")
          .insert(uploadedImagesPayload);

        if (imagesError) throw imagesError;
      }

      const { data: fullTopic, error: fetchError } = await supabase
        .from("note_topics")
        .select("*, note_images(*)")
        .eq("id", topicId)
        .single();

      if (fetchError) throw fetchError;

      onNoteCreated(fullTopic);
      onClose();
    } catch (err) {
      console.error("Error creating note topic:", err.message);
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
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition p-1 rounded-lg hover:bg-zinc-800">
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

// =========================================================================
// 3. NOTE DETAIL VIEW COMPONENT (Single Topic Page View)
// =========================================================================
function TopicDetailView({ topic: initialTopic, onBack, onTopicUpdated }) {
  const [topic, setTopic] = useState(initialTopic);
  const [imagesWithUrls, setImagesWithUrls] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadImages() {
      if (!topic.note_images || topic.note_images.length === 0) {
        if (isMounted) {
          setImagesWithUrls([]);
          setLoadingImages(false);
        }
        return;
      }

      const processed = await Promise.all(
        topic.note_images.map(async (img) => {
          const { data, error } = await supabase.storage
            .from("handwritten-notes")
            .createSignedUrl(img.storage_path, 3600);

          return {
            ...img,
            publicUrl: error ? null : data.signedUrl
          };
        })
      );

      if (isMounted) {
        setImagesWithUrls(processed);
        setLoadingImages(false);
      }
    }

    loadImages();
    return () => { isMounted = false; };
  }, [topic]);

  const handleDeleteImage = async (imageId, storagePath) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const { error: storageError } = await supabase.storage.from("handwritten-notes").remove([storagePath]);
      if (storageError) console.warn("Storage removal warning:", storageError.message);

      const { error } = await supabase.from("note_images").delete().eq("id", imageId);
      if (error) throw error;

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

      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-4">
          Notebook Pages ({imagesWithUrls.length})
        </h3>

        {loadingImages ? (
          <div className="text-zinc-500 text-xs py-12 text-center flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading pages...
          </div>
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
                  <img src={img.publicUrl} alt={img.file_name || `Page ${idx + 1}`} className="w-full h-full object-cover" />
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

// =========================================================================
// 4. MAIN CHAPTER DETAIL VIEW (HERO COMPONENT)
// =========================================================================
export default function ChapterDetailView({ user, subject, initialChapter, initialNoteTopics = [] }) {
  const [chapter, setChapter] = useState(initialChapter);
  const [topics, setTopics] = useState(initialNoteTopics);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_desc");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Toggle Chapter Completion Status
  const handleToggleComplete = async () => {
    if (updatingStatus) return;
    try {
      setUpdatingStatus(true);
      const newStatus = !chapter.is_completed;
      const { error } = await supabase
        .from("chapters")
        .update({ is_completed: newStatus })
        .eq("id", chapter.id);

      if (error) throw error;
      setChapter(prev => ({ ...prev, is_completed: newStatus }));
    } catch (err) {
      console.error("Error updating chapter status:", err.message);
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete Topic Handler
  const handleDeleteTopic = async (topicId) => {
    if (!confirm("Are you sure you want to delete this topic and all its handwritten pages?")) return;

    try {
      const { data: images } = await supabase
        .from("note_images")
        .select("storage_path")
        .eq("note_topic_id", topicId);

      if (images && images.length > 0) {
        const paths = images.map(img => img.storage_path);
        await supabase.storage.from("handwritten-notes").remove(paths);
      }

      const { error } = await supabase
        .from("note_topics")
        .delete()
        .eq("id", topicId);

      if (error) throw error;

      setTopics(prev => prev.filter(t => t.id !== topicId));
      if (selectedTopic?.id === topicId) setSelectedTopic(null);
    } catch (err) {
      console.error("Error deleting note topic:", err.message);
      alert("Failed to delete note topic.");
    }
  };

  // Filter & Sort Topics using useMemo
  const filteredAndSortedTopics = useMemo(() => {
    let result = [...topics];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      if (sortBy === "updated_desc") {
        return dateB - dateA;
      } else if (sortBy === "updated_asc") {
        return dateA - dateB;
      } else if (sortBy === "title_asc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "title_desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [topics, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/subjects/${subject?.id}`}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center"
            title="Back to subject chapters"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <Link 
              href={`/dashboard/subjects/${subject?.id}`}
              className="text-xs font-medium text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition"
            >
              {subject?.name || "Subject"}
            </Link>
            <h1 className="text-xl font-semibold text-zinc-100 mt-0.5">
              {chapter?.title || "Chapter"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            disabled={updatingStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              chapter?.is_completed 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {updatingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : chapter?.is_completed ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            <span>{chapter?.is_completed ? "Completed" : "Mark Complete"}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {chapter?.description && !selectedTopic && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 text-sm text-zinc-300">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Chapter Overview</h3>
            <p>{chapter.description}</p>
          </div>
        )}

        {selectedTopic ? (
          <TopicDetailView
            topic={selectedTopic}
            onBack={() => setSelectedTopic(null)}
            onTopicUpdated={(updated) => {
              setSelectedTopic(updated);
              setTopics(topics.map(t => t.id === updated.id ? updated : t));
            }}
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-medium text-zinc-200">My Notes</h2>
              <p className="text-xs text-zinc-500">Keep your handwritten notes organized for this chapter.</p>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search handwritten notes by topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400">
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="updated_desc" className="bg-zinc-900">Recently Updated</option>
                    <option value="updated_asc" className="bg-zinc-900">Oldest Updated</option>
                    <option value="title_asc" className="bg-zinc-900">A – Z</option>
                    <option value="title_desc" className="bg-zinc-900">Z – A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gallery Grid or Empty State */}
            {filteredAndSortedTopics.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-zinc-300 font-medium">No notes yet</div>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Save your handwritten notes here and keep everything for this chapter in one place.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition"
                >
                  + Create Note
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredAndSortedTopics.map((topic) => {
                  const pageCount = topic.note_images?.length || 0;
                  const updatedDate = new Date(topic.updated_at || topic.created_at).toLocaleDateString();

                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition group"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-zinc-200 text-sm group-hover:text-white transition line-clamp-1">
                            {topic.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTopic(topic.id);
                            }}
                            className="text-zinc-600 hover:text-red-400 p-1 transition opacity-0 group-hover:opacity-100"
                            title="Delete topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {topic.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2">{topic.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                          <FileText className="w-3.5 h-3.5 text-zinc-500" />
                          {pageCount} {pageCount === 1 ? "handwritten page" : "handwritten pages"}
                        </span>
                        <span>{updatedDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Note Modal */}
      {isCreateModalOpen && (
        <CreateNoteModal
          user={user}
          chapterId={chapter.id}
          onClose={() => setIsCreateModalOpen(false)}
          onNoteCreated={(newTopic) => {
            setTopics(prev => [newTopic, ...prev]);
          }}
        />
      )}
    </div>
  );
}