'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Check, X } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isPasswordLengthValid = password.length >= 8;
  const arePasswordsMatching = password.length > 0 && password === confirmPassword;

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!arePasswordsMatching) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!isPasswordLengthValid) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-start items-center pt-16 pb-12 px-4 font-sans text-zinc-100 relative overflow-x-hidden">
      
      {/* Full-Screen Modern Cinematic Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#0c0d10] border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <div className="relative mb-4">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-zinc-100 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen size={16} className="text-zinc-400" />
              </div>
            </div>
            <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Creating account</h2>
            <p className="text-xs text-zinc-400 mt-1 text-center">Setting up your secure study workspace...</p>
          </div>
        </div>
      )}

      <Link href="/" className="flex items-center space-x-3.5 mb-10 group cursor-pointer">
        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/85 text-zinc-200 flex items-center justify-center shadow-lg shadow-zinc-900/50 group-hover:border-zinc-500 transition-all duration-300">
          <BookOpen size={20} strokeWidth={2.2} />
        </div>
        <span className="text-[22px] font-extrabold tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-300">
          STUDY OS
        </span>
      </Link>

      <div className="w-full max-w-[460px] bg-[#0c0d10] border border-zinc-800/80 rounded-[32px] shadow-2xl px-10 py-12 relative overflow-hidden">
        {isSubmitted ? (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
            <div className="w-14 h-14 bg-zinc-900 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-5 border border-zinc-700">
              <CheckCircle2 size={30} />
            </div>
            <h1 className="text-[24px] font-extrabold tracking-tight text-zinc-100 mb-2">
              Check your email
            </h1>
            <p className="text-[14px] text-zinc-400 mb-8 leading-relaxed">
              Account created successfully! We've sent a verification link to <span className="font-semibold text-zinc-200">{email}</span>.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3.5 px-4 bg-zinc-100 hover:bg-white active:bg-zinc-300 text-zinc-950 font-semibold rounded-xl text-sm transition-all shadow-sm text-center cursor-pointer"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <div>
            <div className="text-center mb-9">
              <h1 className="text-[28px] font-extrabold tracking-tight text-zinc-100 mb-2">
                Create your account
              </h1>
              <p className="text-[15px] text-zinc-400">
                Start your productivity and study journey with studyOS
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3.5 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl text-center animate-in fade-in duration-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-zinc-300 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>

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
                <div className="mt-2 flex items-center space-x-1.5 text-xs">
                  {isPasswordLengthValid ? (
                    <span className="text-zinc-300 flex items-center gap-1"><Check size={13} className="text-zinc-400" /> At least 8 characters</span>
                  ) : (
                    <span className="text-zinc-500">Must be at least 8 characters</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-zinc-300 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all pr-10"
                  />
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {arePasswordsMatching ? (
                        <Check size={18} className="text-zinc-300" />
                      ) : (
                        <X size={18} className="text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 px-4 bg-zinc-100 hover:bg-white active:scale-[0.98] text-zinc-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create account</span>
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-zinc-300 hover:text-white transition-colors">
                Log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}