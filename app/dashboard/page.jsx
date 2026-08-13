'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, LogOut, Mail, Loader2 } from 'lucide-react';

// Initialize the Supabase browser client outside the component 
// to keep its reference completely stable across renders.
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUserSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.replace('/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    }

    getUserSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 font-sans">
        <Loader2 size={24} className="animate-spin text-zinc-100" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-zinc-100">
      
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-zinc-800/80 px-8 py-4 flex items-center justify-between bg-[#0c0d10]">
        <Link href="/dashboard" className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/85 text-zinc-200 flex items-center justify-center shadow-md">
            <BookOpen size={18} strokeWidth={2.2} />
          </div>
          <span className="text-[18px] font-extrabold tracking-tight text-zinc-100">
            studyOS <span className="text-xs font-normal text-zinc-500 uppercase tracking-widest ml-2">Dashboard</span>
          </span>
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-8 mt-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 mb-1">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-400">
            Welcome to your active studyOS workspace session.
          </p>
        </div>

        {/* Profile Card showing Email only */}
        <div className="bg-[#0c0d10] border border-zinc-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-lg font-semibold text-zinc-200 border-b border-zinc-800 pb-4">
            Account Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black border border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-zinc-200">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}