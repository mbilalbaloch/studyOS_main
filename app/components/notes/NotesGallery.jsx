"use client";

import React, { useState, useMemo } from "react";
import { Search, FileText, Calendar, ArrowUpDown, Trash2 } from "lucide-react";

export default function NotesGallery({ topics, onSelectTopic, onDeleteTopic }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_desc");

  const filteredAndSortedTopics = useMemo(() => {
    let result = [...topics];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "updated_desc") {
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      } else if (sortBy === "updated_asc") {
        return new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at);
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
    <div className="flex flex-col gap-4">
      {/* Search and Sort Toolbar */}
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

      {/* Topics Grid */}
      {filteredAndSortedTopics.length === 0 ? (
        <div className="text-zinc-500 text-xs py-8 text-center">
          {searchQuery ? "No matching handwritten notes found." : "No handwritten notes yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAndSortedTopics.map((topic) => {
            const pageCount = topic.note_images?.length || 0;
            const updatedDate = new Date(topic.updated_at || topic.created_at).toLocaleDateString();

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
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
                        onDeleteTopic(topic.id);
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
                    {pageCount} {pageCount === 1 ? "page" : "pages"}
                  </span>
                  <span>{updatedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}