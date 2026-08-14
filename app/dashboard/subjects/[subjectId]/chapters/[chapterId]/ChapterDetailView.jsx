'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    CheckCircle2,
    Circle,
    Edit3,
    Save,
    BookOpen,
    FileText,
    Layers,
    X,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

export default function ChapterDetailView({ user, subject, initialChapter, initialNotes }) {
    const [supabase] = useState(createClient);

    const [chapter, setChapter] = useState(initialChapter);
    const [notes, setNotes] = useState(initialNotes?.content || '');
    const [notesId, setNotesId] = useState(initialNotes?.id || null);

    // UI states
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [contentTitle, setContentTitle] = useState(initialChapter?.title || '');
    const [contentDescription, setContentDescription] = useState(initialChapter?.description || '');
    const [studyContent, setStudyContent] = useState(initialChapter?.content || '');

    const [savingContent, setSavingContent] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesSavedIndicator, setNotesSavedIndicator] = useState(false);

    if (!chapter || !subject) {
        return (
            <div className="flex items-center justify-center min-h-[40vh] text-zinc-500 text-sm pt-8">
                Chapter details could not be loaded.
            </div>
        );
    }

    // Toggle Chapter Completion
    const handleToggleComplete = async () => {
        const updatedStatus = !chapter.is_completed;
        try {
            const { error } = await supabase
                .from('chapters')
                .update({ is_completed: updatedStatus })
                .eq('id', chapter.id);

            if (error) throw error;
            setChapter({ ...chapter, is_completed: updatedStatus });
        } catch (err) {
            console.error('Error updating completion:', err);
        }
    };

    // Save Learning Content/Details
    const handleSaveContent = async (e) => {
        e.preventDefault();
        setSavingContent(true);

        try {
            const { error } = await supabase
                .from('chapters')
                .update({
                    title: contentTitle.trim(),
                    description: contentDescription.trim(),
                    content: studyContent.trim(),
                })
                .eq('id', chapter.id);

            if (error) throw error;

            setChapter({
                ...chapter,
                title: contentTitle.trim(),
                description: contentDescription.trim(),
                content: studyContent.trim(),
            });
            setIsEditingContent(false);
        } catch (err) {
            console.error('Error saving content:', err);
        } finally {
            setSavingContent(false);
        }
    };

    // Save Personal Notes
    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            if (notesId) {
                const { error } = await supabase
                    .from('chapter_notes')
                    .update({ content: notes })
                    .eq('id', notesId)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('chapter_notes')
                    .insert([
                        {
                            chapter_id: chapter.id,
                            user_id: user.id,
                            content: notes
                        }
                    ])
                    .select()
                    .single();

                if (error) throw error;
                if (data) setNotesId(data.id);
            }

            setNotesSavedIndicator(true);
            setTimeout(() => setNotesSavedIndicator(false), 2000);
        } catch (err) {
            console.error('Error saving notes:', err);
        } finally {
            setSavingNotes(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pt-6 pb-16">

            {/* Breadcrumb & Header */}
            <div className="space-y-4 pt-[15px]">
                <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Subjects</Link>
                    <span className="text-zinc-700">/</span>
                    <Link href={`/dashboard/subjects/${subject.id}`} className="hover:text-zinc-300 transition-colors">
                        {subject.name}
                    </Link>
                    <span className="text-zinc-700">/</span>
                    <span className="text-zinc-300 truncate max-w-[200px]">{chapter.title}</span>
                </nav>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">
                                {chapter.title}
                            </h1>
                            <button
                                onClick={() => setIsEditingContent(true)}
                                className="h-8 w-8 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all cursor-pointer shadow-sm"
                                title="Edit Chapter Info"
                            >
                                <Edit3 size={14} />
                            </button>
                        </div>
                        {chapter.description && (
                            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{chapter.description}</p>
                        )}
                    </div>

                    <button
                        onClick={handleToggleComplete}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border shadow-sm ${
                            chapter.is_completed
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                                : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100'
                        }`}
                    >
                        {chapter.is_completed ? (
                            <>
                                <CheckCircle2 size={15} className="text-emerald-400" />
                                <span>Completed</span>
                            </>
                        ) : (
                            <>
                                <Circle size={15} className="text-zinc-500" />
                                <span>Mark as completed</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="h-px w-full bg-zinc-800/60" />

            {/* Main Learning Area */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        <BookOpen size={14} className="text-zinc-500" />
                        <span>Study Content</span>
                    </div>
                    {!isEditingContent && chapter.content && (
                        <button
                            onClick={() => setIsEditingContent(true)}
                            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer font-medium"
                        >
                            Edit Content
                        </button>
                    )}
                </div>

                {isEditingContent ? (
                    <form onSubmit={handleSaveContent} className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm space-y-5 shadow-xl">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={13} className="text-zinc-400" />
                                Edit Chapter & Material
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditingContent(false)}
                                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium">Chapter Title</label>
                            <input
                                type="text"
                                value={contentTitle}
                                onChange={(e) => setContentTitle(e.target.value)}
                                className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium">Short Description</label>
                            <input
                                type="text"
                                value={contentDescription}
                                onChange={(e) => setContentDescription(e.target.value)}
                                className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium">Main Learning Material (Headings, Formulas, Notes, Examples)</label>
                            <textarea
                                value={studyContent}
                                onChange={(e) => setStudyContent(e.target.value)}
                                rows={12}
                                placeholder="Write or paste structured study material here..."
                                className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 font-mono text-xs leading-relaxed transition-colors resize-y"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditingContent(false)}
                                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={savingContent}
                                className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                            >
                                {savingContent ? 'Saving...' : 'Save Content'}
                            </button>
                        </div>
                    </form>
                ) : chapter.content ? (
                    <div className="p-7 rounded-2xl border border-zinc-800/60 bg-zinc-950/20 backdrop-blur-sm text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans shadow-sm">
                        {chapter.content}
                    </div>
                ) : (
                    <div className="border border-dashed border-zinc-800/80 rounded-2xl p-12 text-center bg-zinc-950/20 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-500 mx-auto shadow-inner">
                            <Layers size={20} strokeWidth={1.8} />
                        </div>
                        <div className="space-y-1 max-w-xs mx-auto">
                            <h3 className="text-sm font-medium text-zinc-200">No learning content yet</h3>
                            <p className="text-xs text-zinc-400">
                                Add notes, code snippets, or formulas to start studying this chapter.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditingContent(true)}
                            className="inline-flex items-center justify-center px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                            Add Content
                        </button>
                    </div>
                )}
            </section>

            {/* Chapter Notes Section */}
            <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        <FileText size={14} className="text-zinc-500" />
                        <span>Personal Notes</span>
                    </div>
                    {notesSavedIndicator && (
                        <span className="text-xs text-emerald-400 font-medium animate-fade-in">Saved successfully</span>
                    )}
                </div>

                <div className="space-y-3">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        placeholder="Write personal notes, thoughts, or reminders for this chapter..."
                        className="w-full bg-zinc-950/20 border border-zinc-800/60 backdrop-blur-sm rounded-2xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors resize-y shadow-sm"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            <Save size={13} />
                            <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}