'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  BookOpen, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  X, 
  ArrowRight,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function SubjectsView({ user, supabase }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active dropdown menu for cards
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch subjects for current user with chapter counts
  useEffect(() => {
    async function fetchSubjects() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select(`
            *,
            chapters (count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching subjects:', error);
        } else {
          const formatted = (data || []).map(sub => ({
            ...sub,
            chapterCount: sub.chapters?.[0]?.count || 0
          }));
          setSubjects(formatted);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [user, supabase]);

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setDescription(subject.description || '');
    setFormError('');
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingSubject) {
        // Update
        const { data, error } = await supabase
          .from('subjects')
          .update({ name: name.trim(), description: description.trim() })
          .eq('id', editingSubject.id)
          .eq('user_id', user.id)
          .select();

        if (error) throw error;

        setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, name: name.trim(), description: description.trim() } : s));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('subjects')
          .insert([
            { 
              name: name.trim(), 
              description: description.trim(), 
              user_id: user.id 
            }
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setSubjects([{ ...data[0], chapterCount: 0 }, ...subjects]);
        }
      }

      setIsModalOpen(false);
      setName('');
      setDescription('');
      setEditingSubject(null);
    } catch (err) {
      console.error('Error saving subject:', err);
      setFormError(err.message || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSubjects(subjects.filter(s => s.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">
            Subjects
          </h1>
          <p className="text-sm text-zinc-400">
            Organize your learning by subject.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} strokeWidth={2.2} />
          <span>New Subject</span>
        </button>
      </div>

      {/* Subjects Grid / Empty State */}
      {subjects.length === 0 ? (
        <div className="border border-zinc-800/80 rounded-xl p-12 text-center bg-[#0c0d10]/40 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <BookOpen size={18} strokeWidth={1.8} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-zinc-200">No subjects yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Create your first subject to start organizing your studies.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.2} />
            <span>Create Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((sub) => {
            const isMenuOpen = activeMenuId === sub.id;

            return (
              <div 
                key={sub.id}
                className="group relative p-5 rounded-xl border border-zinc-800/80 bg-[#0c0d10]/40 hover:border-zinc-700 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-zinc-100 transition-colors">
                      <BookOpen size={17} strokeWidth={1.7} />
                    </div>
                    <div>
                     <Link href={`/dashboard/subjects/${sub.id}`} className="text-sm font-medium text-zinc-200 hover:text-white transition-colors">
  {sub.name}
</Link>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-0.5">
                        <Layers size={12} />
                        <span>{sub.chapterCount} {sub.chapterCount === 1 ? 'chapter' : 'chapters'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : sub.id);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setDeleteId(sub.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 transition-colors text-left"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {sub.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {sub.description}
                  </p>
                )}

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                 <Link 
  href={`/dashboard/subjects/${sub.id}`}
  className="text-xs font-medium text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors"
>
  <span>View details</span>
  <ArrowRight size={13} />
</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d10] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">
                {editingSubject ? 'Edit Subject' : 'Create New Subject'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Subject Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Physics, Mathematics"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview or syllabus focus..."
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
                  {submitting ? 'Saving...' : (editingSubject ? 'Save Changes' : 'Create Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d10] border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100">Delete Subject?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete this subject? All associated chapters will also be removed. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSubject(deleteId)}
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