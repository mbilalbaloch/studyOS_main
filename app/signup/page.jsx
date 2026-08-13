'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Check, X } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

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

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-start items-center pt-16 pb-12 px-4 font-sans text-zinc-100 relative overflow-x-hidden">
      
      {/* Full-Screen Minimalist Dotted Circle Spinner Loading Overlay */}
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
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Creating account</h2>
          <p className="text-xs text-zinc-400 mt-1 text-center">Setting up your workspace...</p>
        </div>
      )}

      <Link href="/" className="flex items-center space-x-3.5 mb-10 group cursor-pointer">
        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/85 text-zinc-200 flex items-center justify-center shadow-lg shadow-zinc-900/50 group-hover:border-zinc-500 transition-all duration-300">
          <BookOpen size={20} strokeWidth={2.2} />
        </div>
        <span className="text-[22px] font-extrabold tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-300">
          STUDY OS.
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
              className="inline-block w-full py-3.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl text-sm transition-all text-center"
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0c0d10] px-3 text-zinc-500 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-black border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/>
              </svg>
              <span>Google</span>
            </button>

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