'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    ArrowLeft,
    Plus,
    BookOpen,
    CheckCircle2,
    Circle,
    Trash2,
    Edit3,
    X,
    Layers
} from 'lucide-react';
import Link from 'next/link';

// Create the browser client outside the component to prevent recreation loops
const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

export default function SubjectDetailView({ user, initialSubject, initialChapters }) {
    // Use lazy state initialization so the client is created once
    const [supabase] = useState(createClient);

    const [subject] = useState(initialSubject);
    const [chapters, setChapters] = useState(initialChapters || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Delete modal state
    const [deleteChapterId, setDeleteChapterId] = useState(null);

    const handleOpenCreateModal = () => {
        setEditingChapter(null);
        setTitle('');
        setDescription('');
        setFormError('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (chapter) => {
        setEditingChapter(chapter);
        setTitle(chapter.title);
        setDescription(chapter.description || '');
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSaveChapter = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setFormError('Chapter title is required.');
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            if (editingChapter) {
                // Update chapter
                const { error } = await supabase
                    .from('chapters')
                    .update({
                        title: title.trim(),
                        description: description.trim()
                    })
                    .eq('id', editingChapter.id)
                    .eq('user_id', user.id);

                if (error) throw error;

                setChapters(chapters.map(c => c.id === editingChapter.id ? { ...c, title: title.trim(), description: description.trim() } : c));
            } else {
                // Insert chapter
                const { data, error } = await supabase
                    .from('chapters')
                    .insert([
                        {
                            subject_id: subject.id,
                            user_id: user.id,
                            title: title.trim(),
                            description: description.trim(),
                            is_completed: false
                        }
                    ])
                    .select();

                if (error) throw error;

                if (data && data[0]) {
                    setChapters([...chapters, data[0]]);
                }
            }

            setIsModalOpen(false);
            setTitle('');
            setDescription('');
            setEditingChapter(null);
        } catch (err) {
            console.error('Error saving chapter:', err);
            setFormError(err.message || 'Failed to save chapter.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleComplete = async (chapter) => {
        const updatedStatus = !chapter.is_completed;
        try {
            const { error } = await supabase
                .from('chapters')
                .update({ is_completed: updatedStatus })
                .eq('id', chapter.id)
                .eq('user_id', user.id);

            if (error) throw error;

            setChapters(chapters.map(c => c.id === chapter.id ? { ...c, is_completed: updatedStatus } : c));
        } catch (err) {
            console.error('Error updating chapter status:', err);
        }
    };

    const handleDeleteChapter = async (id) => {
        try {
            const { error } = await supabase
                .from('chapters')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            setChapters(chapters.filter(c => c.id !== id));
            setDeleteChapterId(null);
        } catch (err) {
            console.error('Error deleting chapter:', err);
        }
    };

    if (!subject) {
        return (
            <div className="space-y-4 max-w-4xl py-12 text-center">
                <h2 className="text-lg font-semibold text-zinc-200">Subject not found</h2>
                <p className="text-xs text-zinc-400">The subject you are looking for does not exist or has been removed.</p>
                <div>
                    <Link href="/dashboard" className="text-xs font-medium text-zinc-100 hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const completedCount = chapters.filter(c => c.is_completed).length;
    const progressPercentage = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;

    return (
        <div className="space-y-8 max-w-4xl">

            {/* Back button & Subject Title Header */}
            <div className="space-y-3">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Dashboard</span>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">
                            {subject.name}
                        </h1>
                        {subject.description ? (
                            <p className="text-sm text-zinc-400">{subject.description}</p>
                        ) : (
                            <p className="text-xs text-zinc-500">Manage chapters and track your syllabus progress.</p>
                        )}
                    </div>

                    <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-all cursor-pointer self-start sm:self-auto"
                    >
                        <Plus size={15} strokeWidth={2.2} />
                        <span>Add Chapter</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar Overview */}
            {chapters.length > 0 && (
                <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#0c0d10]/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Syllabus Progress</span>
                        <span className="text-zinc-200 font-semibold">{completedCount} of {chapters.length} completed ({progressPercentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                            className="h-full bg-zinc-100 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Chapters List / Empty State */}
            {chapters.length === 0 ? (
                <div className="border border-zinc-800/80 rounded-xl p-12 text-center bg-[#0c0d10]/40 space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                        <Layers size={18} strokeWidth={1.8} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-zinc-200">No chapters added yet</h3>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                            Break down this subject into distinct chapters or topics to track your preparation.
                        </p>
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                        <Plus size={15} strokeWidth={2.2} />
                        <span>Add First Chapter</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {chapters.map((chapter, index) => (
                        <div
                            key={chapter.id}
                            className="p-4 rounded-xl border border-zinc-800/80 bg-[#0c0d10]/40 hover:border-zinc-700 transition-all flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3.5 min-w-0">
                                <button
                                    onClick={() => handleToggleComplete(chapter)}
                                    className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                                    title={chapter.is_completed ? "Mark incomplete" : "Mark complete"}
                                >
                                    {chapter.is_completed ? (
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    ) : (
                                        <Circle size={20} className="text-zinc-600" />
                                    )}
                                </button>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-zinc-500">#{index + 1}</span>
                                        {/* Clickable Chapter Title leading to the detail view */}
                                        <Link
                                            href={`/dashboard/subjects/${subject.id}/chapters/${chapter.id}`}
                                            className="..."
                                        >
                                            {chapter.title}
                                        </Link>
                                    </div>
                                    {chapter.description && (
                                        <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                            {chapter.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => handleOpenEditModal(chapter)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
                                    title="Edit chapter"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button
                                    onClick={() => setDeleteChapterId(chapter.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                                    title="Delete chapter"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Chapter Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0c0d10] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-100">
                                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveChapter} className="space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Chapter Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Kinematics, Vectors, Calculus"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Description / Key Notes (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Summary of topics covered..."
                                    rows={3}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? 'Saving...' : (editingChapter ? 'Save Changes' : 'Add Chapter')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteChapterId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0c0d10] border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
                        <h3 className="text-sm font-semibold text-zinc-100">Delete Chapter?</h3>
                        <p className="text-xs text-zinc-400">
                            Are you sure you want to delete this chapter? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setDeleteChapterId(null)}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteChapter(deleteChapterId)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}