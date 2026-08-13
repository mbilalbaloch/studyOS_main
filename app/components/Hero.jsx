'use client';
import Link from 'next/link';
export default function Hero() {
  return (
    <section className="relative w-full bg-neutral-950 pt-28 pb-24 sm:pb-32 md:pb-40 lg:pb-48 border-b border-neutral-800 overflow-hidden">
      <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-6 sm:mb-8">
          Your Study Workspace
        </p>

        {/* Main Headline with fluid clamp typography for natural 2-3 line wrapping on mobile */}
        <h1 
          className="font-bold tracking-tight text-white leading-[1.08] mb-6 sm:mb-8 max-w-[18ch] sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
          style={{ fontSize: 'clamp(2.5rem, 7.5vw, 4.5rem)' }}
        >
          Study smarter. Stay organized.
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-400 font-normal leading-relaxed max-w-sm sm:max-w-md md:max-w-xl mb-10 sm:mb-12">
          One simple workspace for your subjects, chapters, notes, practice, tests, and progress.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-xs sm:max-w-none">
          <Link
            href="/signup"
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 inline-flex items-center justify-center rounded-md bg-white px-7 py-3.5 text-sm font-medium text-neutral-950 hover:bg-neutral-200 transition-colors shadow-sm active:scale-[0.98]"
          >
            Get Started
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 inline-flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 px-7 py-3.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors active:scale-[0.98]"
          >
            Learn More
          </Link>
        </div>

      </div>
    </section>
  );
}