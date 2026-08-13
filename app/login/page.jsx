'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.refresh();
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-start items-center pt-16 pb-12 px-4 font-sans text-zinc-100 relative overflow-x-hidden">
      
      {/* Full-Screen Minimalist Dotted Circle Spinner Loading Overlay (No Box) */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative w-12 h-12 mb-4 animate-spin">
            {[...Array(8)].map((_, i) => {
              const rotation = i * 45;
              const opacity = (i + 1) / 8;
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-zinc-100 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `rotate(${rotation}deg) translate(0, -16px)`,
                    opacity: opacity,
                  }}
                />
              );
            })}
          </div>
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Authenticating</h2>
          <p className="text-xs text-zinc-400 mt-1 text-center">Entering studyOS...</p>
        </div>
      )}

      {/* Clickable Brand Header */}
      <Link href="/" className="flex items-center space-x-3.5 mb-10 group cursor-pointer">
        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/85 text-zinc-200 flex items-center justify-center shadow-lg shadow-zinc-900/50 group-hover:border-zinc-500 transition-all duration-300">
          <BookOpen size={20} strokeWidth={2.2} />
        </div>
        <span className="text-[22px] font-extrabold tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-300">
          STUDY OS
        </span>
      </Link>

      {/* Main Form Box */}
      <div className="w-full max-w-[460px] bg-[#0c0d10] border border-zinc-800/80 rounded-[32px] shadow-2xl px-10 py-12 relative overflow-hidden">
        <div className="text-center mb-9">
          <h1 className="text-[28px] font-extrabold tracking-tight text-zinc-100 mb-2">
            Welcome back
          </h1>
          <p className="text-[15px] text-zinc-400">
            Log in to continue your productivity and study journey with studyOS
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl text-center animate-in fade-in duration-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-zinc-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-300 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-zinc-100 hover:bg-white active:scale-[0.98] text-zinc-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Log in</span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-zinc-300 hover:text-white transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}