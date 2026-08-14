'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Sparkles, ArrowRight } from 'lucide-react'; // Or your project's existing icon set

export default function ChapterHubView({ subjectId, chapterId, chapterName }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {chapterName || 'Chapter Hub'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select a section below to manage your materials for this chapter.
        </p>
      </div>

      {/* Hub Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes Card */}
        <Link
          href={`/dashboard/subjects/${subjectId}/chapters/${chapterId}/notes`}
          className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Notes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review, write, and organize your notes for this chapter.
            </p>
          </div>

          <div className="mt-6 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Open notes</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </Link>

        {/* Practice Card */}
        <Link
          href={`/dashboard/subjects/${subjectId}/chapters/${chapterId}/practice`}
          className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Practice
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Test your knowledge with chapter MCQs, quizzes, and problem sets.
            </p>
          </div>

          <div className="mt-6 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Start practice</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}