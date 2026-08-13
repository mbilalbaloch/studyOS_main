'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Check, X } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // Listen for the session recovery event when the page loads with a token/code
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Fallback check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isPasswordLengthValid = password.length >= 8;
  const arePasswordsMatching = password.length > 0 && password === confirmPassword;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isPasswordLengthValid) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (!arePasswordsMatching) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-start items-center pt-16 pb-12 px-4 font-sans text-zinc-100 relative overflow-x-hidden">
      <Link href="/" className="flex items-center space-x-3.5 mb-10 group cursor-pointer">
        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/85 text-zinc-200 flex items-center justify-center shadow-lg shadow-zinc-900/50">
          <BookOpen size={20} strokeWidth={2.2} />
        </div>
        <span className="text-[22px] font-extrabold tracking-tight text-zinc-100">
          STUDY OS.
        </span>
      </Link>

      <div className="w-full max-w-[460px] bg-[#0c0d10] border border-zinc-800/80 rounded-[32px] shadow-2xl px-10 py-12 relative overflow-hidden">
        <div className="text-center mb-9">
          <h1 className="text-[28px] font-extrabold tracking-tight text-zinc-100 mb-2">
            Set new password
          </h1>
          <p className="text-[15px] text-zinc-400">
            Enter a secure new password for your studyOS account
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="text-center py-6 text-zinc-200">
            <p className="text-sm font-semibold text-emerald-400 mb-2">Password updated successfully!</p>
            <p className="text-xs text-zinc-400">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-zinc-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-zinc-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}