'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function PracticePage({ params }) {
  // Unwrap params using React.use() in client components
  const unwrappedParams = use(params);
  const { subjectId, chapterId } = unwrappedParams;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/subjects/${subjectId}/chapters/${chapterId}`}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center"
            title="Back to Chapter Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Chapter Practice</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Test your knowledge and prepare for exams</p>
          </div>
        </div>
      </header>

      {/* Main Content (Coming Soon State) */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-inner">
          <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-medium text-emerald-400 uppercase tracking-wider mx-auto">
            Coming Soon
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100">Practice Modules in Development</h2>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">
            We are building custom multiple-choice question banks and entry test simulations for this chapter. Stay tuned!
          </p>
        </div>

        <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 text-left flex flex-col gap-3 mt-4">
          <div className="text-xs font-medium text-zinc-200">Upcoming Features:</div>
          <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
            <li>Board & Entry Test targeted practice questions</li>
            <li>Instant answer checking with detailed step explanations</li>
            <li>Chapter performance tracking</li>
          </ul>
        </div>
      </main>
    </div>
  );
}